from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class ActivityResponse(BaseModel):
    id: int
    lesson_id: int
    type: str
    title: Optional[str]
    json_data: Any
    created_at: datetime

    class Config:
        from_attributes = True
