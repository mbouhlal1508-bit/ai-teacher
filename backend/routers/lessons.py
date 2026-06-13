from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Lesson
from schemas.lesson import LessonCreate, LessonUpdate, LessonResponse

router = APIRouter()


@router.get("/", response_model=List[LessonResponse])
def list_lessons(user_id: int = 1, db: Session = Depends(get_db)):
    return db.query(Lesson).filter(Lesson.user_id == user_id).order_by(Lesson.created_at.desc()).all()


@router.post("/", response_model=LessonResponse)
def create_lesson(lesson: LessonCreate, user_id: int = 1, db: Session = Depends(get_db)):
    db_lesson = Lesson(user_id=user_id, **lesson.model_dump())
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson


@router.get("/{lesson_id}", response_model=LessonResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="الدرس غير موجود")
    return lesson


@router.put("/{lesson_id}", response_model=LessonResponse)
def update_lesson(lesson_id: int, data: LessonUpdate, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="الدرس غير موجود")
    for key, val in data.model_dump(exclude_none=True).items():
        setattr(lesson, key, val)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete("/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="الدرس غير موجود")
    db.delete(lesson)
    db.commit()
    return {"message": "تم حذف الدرس بنجاح"}
