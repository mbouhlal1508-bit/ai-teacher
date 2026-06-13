from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from database import Base


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    game_type = Column(String(100), nullable=False)
    config = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
