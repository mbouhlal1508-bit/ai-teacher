from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
import json
from database import get_db
from models import Lesson, Activity
from services.export_service import (
    export_to_word, export_to_pptx, export_to_pdf_text,
    format_for_moodle, format_for_google_forms
)

router = APIRouter()


@router.get("/{lesson_id}")
def export_activities(
    lesson_id: int,
    format: str = "word",
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="الدرس غير موجود")

    activities = db.query(Activity).filter(Activity.lesson_id == lesson_id).all()
    combined = {"lesson": lesson.title}
    for a in activities:
        try:
            combined[a.type] = json.loads(a.json_data)
        except json.JSONDecodeError:
            combined[a.type] = a.json_data

    if format == "word":
        buf = export_to_word(combined)
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename={lesson.title}.docx"}
        )
    elif format == "pptx":
        buf = export_to_pptx(combined)
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={"Content-Disposition": f"attachment; filename={lesson.title}.pptx"}
        )
    elif format == "pdf":
        text = export_to_pdf_text(combined)
        return Response(
            content=text,
            media_type="text/plain; charset=utf-8",
            headers={"Content-Disposition": f"attachment; filename={lesson.title}.txt"}
        )
    elif format == "moodle":
        xml = format_for_moodle(combined)
        return Response(
            content=xml,
            media_type="application/xml; charset=utf-8",
            headers={"Content-Disposition": f"attachment; filename={lesson.title}_moodle.xml"}
        )
    elif format == "google_forms":
        data = format_for_google_forms(combined)
        return Response(
            content=json.dumps(data, ensure_ascii=False, indent=2),
            media_type="application/json; charset=utf-8",
            headers={"Content-Disposition": f"attachment; filename={lesson.title}_google_forms.json"}
        )
    else:
        raise HTTPException(status_code=400, detail="صيغة التصدير غير مدعومة")
