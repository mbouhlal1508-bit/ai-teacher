from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class GameResponse(BaseModel):
    id: int
    lesson_id: int
    game_type: str
    config: Any
    created_at: datetime

    class Config:
        from_attributes = True
