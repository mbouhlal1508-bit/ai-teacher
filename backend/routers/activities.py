from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from database import get_db
from models import Activity
from schemas.activity import ActivityResponse

router = APIRouter()


@router.get("/lesson/{lesson_id}", response_model=List[ActivityResponse])
def list_activities(lesson_id: int, db: Session = Depends(get_db)):
    activities = db.query(Activity).filter(Activity.lesson_id == lesson_id).all()
    result = []
    for a in activities:
        result.append(ActivityResponse(
            id=a.id,
            lesson_id=a.lesson_id,
            type=a.type,
            title=a.title,
            json_data=json.loads(a.json_data),
            created_at=a.created_at
        ))
    return result


@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(activity_id: int, json_data: dict, db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="النشاط غير موجود")
    activity.json_data = json.dumps(json_data, ensure_ascii=False)
    db.commit()
    db.refresh(activity)
    return ActivityResponse(
        id=activity.id,
        lesson_id=activity.lesson_id,
        type=activity.type,
        title=activity.title,
        json_data=json.loads(activity.json_data),
        created_at=activity.created_at
    )


@router.delete("/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="النشاط غير موجود")
    db.delete(activity)
    db.commit()
    return {"message": "تم حذف النشاط بنجاح"}
