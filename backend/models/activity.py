from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    type = Column(String(100), nullable=False)
    title = Column(String(500))
    json_data = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
