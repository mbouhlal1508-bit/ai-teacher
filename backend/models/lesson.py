from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from database import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False)
    grade = Column(String(100), nullable=False)
    objectives = Column(Text)
    content = Column(Text)
    subject = Column(String(255), default="التربية الإسلامية")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
