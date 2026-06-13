from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import json
import os
import tempfile
import traceback
from database import get_db
from models import Lesson, Activity, Game
from services.ai_generator import generate_activities, extract_from_pdf_text
from services.import_service import extract_text_from_file

router = APIRouter()


@router.post("/generate")
def generate(
    lesson_id: int = Form(...),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="الدرس غير موجود")

    try:
        result = generate_activities(
            title=lesson.title,
            grade=lesson.grade,
            objectives=lesson.objectives or "",
            content=lesson.content or ""
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"فشل التوليد: {str(e)}")

    activity_types = {
        "mcq": "اختيار متعدد",
        "true_false": "صح وخطأ",
        "fill_blank": "أكمل الفراغ",
        "flashcards": "بطاقات تعليمية",
        "matching": "مطابقة",
        "ordering": "ترتيب",
        "crossword": "كلمات متقاطعة",
        "word_search": "بحث عن الكلمات",
        "question_bank": "بنك أسئلة",
        "lesson_plan": "خطة درس"
    }

    game_types = {
        "mcq": "mcq",
        "matching": "matching",
        "ordering": "ordering",
        "flashcards": "flashcards",
        "crossword": "crossword",
        "word_search": "word_search"
    }

    for key, label in activity_types.items():
        if key in result and result[key]:
            db_activity = Activity(
                lesson_id=lesson_id,
                type=key,
                title=f"{label} - {lesson.title}",
                json_data=json.dumps(result[key], ensure_ascii=False)
            )
            db.add(db_activity)

    for key, game_type in game_types.items():
        if key in result and result[key]:
            db_game = Game(
                lesson_id=lesson_id,
                game_type=game_type,
                config=json.dumps(result[key], ensure_ascii=False)
            )
            db.add(db_game)

    db.commit()
    return {"message": "تم توليد الأنشطة بنجاح", "data": result}


@router.post("/generate-from-text")
def generate_from_text(
    title: str = Form(...),
    grade: str = Form(...),
    objectives: str = Form(""),
    content: str = Form(...),
    user_id: int = Form(1),
    db: Session = Depends(get_db)
):
    lesson = Lesson(
        user_id=user_id,
        title=title,
        grade=grade,
        objectives=objectives,
        content=content
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    try:
        result = generate_activities(
            title=title,
            grade=grade,
            objectives=objectives,
            content=content
        )
    except Exception as e:
        db.delete(lesson)
        db.commit()
        raise HTTPException(status_code=500, detail=f"فشل التوليد: {str(e)}")

    activity_types = {
        "mcq": "اختيار متعدد",
        "true_false": "صح وخطأ",
        "fill_blank": "أكمل الفراغ",
        "flashcards": "بطاقات تعليمية",
        "matching": "مطابقة",
        "ordering": "ترتيب",
        "crossword": "كلمات متقاطعة",
        "word_search": "بحث عن الكلمات",
        "question_bank": "بنك أسئلة",
        "lesson_plan": "خطة درس"
    }

    game_types = {
        "mcq": "mcq",
        "matching": "matching",
        "ordering": "ordering",
        "flashcards": "flashcards",
        "crossword": "crossword",
        "word_search": "word_search"
    }

    for key, label in activity_types.items():
        if key in result and result[key]:
            db_activity = Activity(
                lesson_id=lesson.id,
                type=key,
                title=f"{label} - {title}",
                json_data=json.dumps(result[key], ensure_ascii=False)
            )
            db.add(db_activity)

    for key, game_type in game_types.items():
        if key in result and result[key]:
            db_game = Game(
                lesson_id=lesson.id,
                game_type=game_type,
                config=json.dumps(result[key], ensure_ascii=False)
            )
            db.add(db_game)

    db.commit()

    return {
        "message": "تم توليد الأنشطة بنجاح",
        "lesson_id": lesson.id,
        "data": result
    }


@router.post("/import")
async def import_file(
    file: UploadFile = File(...),
    title: str = Form(""),
    grade: str = Form(""),
    user_id: int = Form(1),
    db: Session = Depends(get_db)
):
    suffix = os.path.splitext(file.filename or "file.pdf")[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        extracted_text = extract_text_from_file(tmp_path)
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="لم يتم استخراج نص من الملف. تأكد أن الملف يحتوي على نص قابل للقراءة.")

        meta = extract_from_pdf_text(extracted_text)
        lesson_title = title or meta.get("lesson_title", file.filename or "درس مستورد")
        lesson_grade = grade or meta.get("grade", "غير محدد")
        objectives_list = meta.get("objectives", [])
        objectives_str = "\n".join(objectives_list) if isinstance(objectives_list, list) else str(objectives_list)

        lesson = Lesson(
            user_id=user_id,
            title=lesson_title,
            grade=lesson_grade,
            objectives=objectives_str,
            content=extracted_text
        )
        db.add(lesson)
        db.commit()
        db.refresh(lesson)

        result = generate_activities(
            title=lesson_title,
            grade=lesson_grade,
            objectives=objectives_str,
            content=extracted_text
        )

        activity_map = {
            "mcq": "اختيار متعدد", "true_false": "صح وخطأ",
            "fill_blank": "أكمل الفراغ", "flashcards": "بطاقات تعليمية",
            "matching": "مطابقة", "ordering": "ترتيب",
            "crossword": "كلمات متقاطعة", "word_search": "بحث عن الكلمات",
            "question_bank": "بنك أسئلة", "lesson_plan": "خطة درس"
        }
        game_map = {"mcq": "mcq", "matching": "matching", "ordering": "ordering",
                    "flashcards": "flashcards", "crossword": "crossword", "word_search": "word_search"}

        for key, label in activity_map.items():
            if key in result and result[key]:
                db.add(Activity(
                    lesson_id=lesson.id, type=key,
                    title=f"{label} - {lesson_title}",
                    json_data=json.dumps(result[key], ensure_ascii=False)
                ))

        for key, gtype in game_map.items():
            if key in result and result[key]:
                db.add(Game(
                    lesson_id=lesson.id, game_type=gtype,
                    config=json.dumps(result[key], ensure_ascii=False)
                ))

        db.commit()

        return {
            "message": "تم استيراد الملف وتوليد الأنشطة بنجاح",
            "lesson_id": lesson.id,
            "extracted_meta": meta,
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"فشل التوليد: {str(e)}")
    finally:
        os.unlink(tmp_path)
