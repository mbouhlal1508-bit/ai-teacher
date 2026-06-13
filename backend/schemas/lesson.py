from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LessonCreate(BaseModel):
    title: str
    grade: str
    objectives: Optional[str] = ""
    content: Optional[str] = ""
    subject: Optional[str] = "التربية الإسلامية"


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    grade: Optional[str] = None
    objectives: Optional[str] = None
    content: Optional[str] = None
    subject: Optional[str] = None


class LessonResponse(BaseModel):
    id: int
    user_id: int
    title: str
    grade: str
    objectives: Optional[str]
    content: Optional[str]
    subject: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
