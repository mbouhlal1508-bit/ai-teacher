from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, func
from database import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    title = Column(String(500))
    time_limit_minutes = Column(Integer, default=30)
    shuffle_questions = Column(Boolean, default=True)
    config = Column(Text)
    created_at = Column(DateTime, server_default=func.now())


class ExamQuestion(Base):
    __tablename__ = "exam_questions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    question_type = Column(String(50), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(Text)
    correct_answer = Column(Text, nullable=False)
    points = Column(Integer, default=1)
