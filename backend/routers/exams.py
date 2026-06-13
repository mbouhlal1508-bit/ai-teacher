from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from database import get_db
from models import Exam, ExamQuestion, Activity
from schemas.exam import ExamCreate, ExamResponse

router = APIRouter()


@router.get("/", response_model=List[ExamResponse])
def list_exams(lesson_id: int = None, db: Session = Depends(get_db)):
    q = db.query(Exam)
    if lesson_id:
        q = q.filter(Exam.lesson_id == lesson_id)
    return q.order_by(Exam.created_at.desc()).all()


@router.post("/")
def create_exam(data: ExamCreate, db: Session = Depends(get_db)):
    exam = Exam(
        lesson_id=data.lesson_id,
        title=data.title or "اختبار إلكتروني",
        time_limit_minutes=data.time_limit_minutes,
        shuffle_questions=data.shuffle_questions
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)

    if data.question_ids:
        activities = db.query(Activity).filter(
            Activity.id.in_(data.question_ids),
            Activity.lesson_id == data.lesson_id
        ).all()
        for activity in activities:
            questions = json.loads(activity.json_data)
            if isinstance(questions, list):
                for q in questions:
                    eq = ExamQuestion(
                        exam_id=exam.id,
                        question_type=q.get("type", "mcq"),
                        question_text=q.get("question", ""),
                        options=json.dumps(q.get("choices", []), ensure_ascii=False),
                        correct_answer=q.get("answer", ""),
                        points=1
                    )
                    db.add(eq)
        db.commit()

    return {"message": "تم إنشاء الاختبار", "exam_id": exam.id}


@router.get("/{exam_id}")
def get_exam(exam_id: int, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="الاختبار غير موجود")
    questions = db.query(ExamQuestion).filter(ExamQuestion.exam_id == exam_id).all()
    return {
        "exam": exam,
        "questions": questions
    }


@router.post("/{exam_id}/submit")
def submit_exam(exam_id: int, answers: dict, db: Session = Depends(get_db)):
    questions = db.query(ExamQuestion).filter(ExamQuestion.exam_id == exam_id).all()
    score = 0
    total = len(questions)
    results = []
    for q in questions:
        user_answer = answers.get(str(q.id), "")
        is_correct = user_answer.strip() == q.correct_answer.strip()
        if is_correct:
            score += q.points
        results.append({
            "question_id": q.id,
            "question": q.question_text,
            "user_answer": user_answer,
            "correct_answer": q.correct_answer,
            "is_correct": is_correct
        })
    return {
        "score": score,
        "total": total,
        "percentage": round((score / total * 100), 1) if total > 0 else 0,
        "results": results
    }
