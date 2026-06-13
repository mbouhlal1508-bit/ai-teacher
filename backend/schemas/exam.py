from pydantic import BaseModel
from typing import Optional, Any, List
from datetime import datetime


class ExamCreate(BaseModel):
    lesson_id: int
    title: Optional[str] = ""
    time_limit_minutes: Optional[int] = 30
    shuffle_questions: Optional[bool] = True
    question_ids: Optional[List[int]] = []


class ExamResponse(BaseModel):
    id: int
    lesson_id: int
    title: Optional[str]
    time_limit_minutes: Optional[int]
    shuffle_questions: Optional[bool]
    config: Any
    created_at: datetime

    class Config:
        from_attributes = True
