from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Lesson, Activity, Game, Exam

router = APIRouter()


@router.get("/dashboard")
def dashboard(user_id: int = 1, db: Session = Depends(get_db)):
    lessons_count = db.query(func.count(Lesson.id)).filter(Lesson.user_id == user_id).scalar() or 0
    lesson_ids = [l.id for l in db.query(Lesson.id).filter(Lesson.user_id == user_id).all()]
    activities_count = 0
    games_count = 0
    if lesson_ids:
        activities_count = db.query(func.count(Activity.id)).filter(
            Activity.lesson_id.in_(lesson_ids)
        ).scalar() or 0
        games_count = db.query(func.count(Game.id)).filter(
            Game.lesson_id.in_(lesson_ids)
        ).scalar() or 0
    exams_count = db.query(func.count(Exam.id)).filter(
        Exam.lesson_id.in_(lesson_ids)
    ).scalar() if lesson_ids else 0

    recent_lessons = db.query(Lesson).filter(Lesson.user_id == user_id)\
        .order_by(Lesson.created_at.desc()).limit(5).all()

    return {
        "lessons_count": lessons_count,
        "activities_count": activities_count,
        "games_count": games_count,
        "exams_count": exams_count,
        "recent_lessons": [
            {"id": l.id, "title": l.title, "grade": l.grade, "created_at": l.created_at.isoformat()}
            for l in recent_lessons
        ]
    }


@router.get("/lesson/{lesson_id}")
def lesson_report(lesson_id: int, db: Session = Depends(get_db)):
    activities = db.query(Activity).filter(Activity.lesson_id == lesson_id).all()
    games = db.query(Game).filter(Game.lesson_id == lesson_id).all()
    return {
        "lesson_id": lesson_id,
        "activities_count": len(activities),
        "games_count": len(games),
        "activities_by_type": {a.type: a.title for a in activities},
        "games_by_type": {g.game_type: g.config for g in games}
    }
