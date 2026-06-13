# المعلم الذكي - AI Teacher Platform

منصة متخصصة لتوليد الأنشطة التعليمية بالذكاء الاصطناعي لمعلم التربية الإسلامية.

## المميزات

- توليد 11 نوعاً من الأنشطة التعليمية تلقائياً بالذكاء الاصطناعي
- ألعاب تفاعلية (اختيار متعدد - مطابقة - ترتيب - بطاقات تعليمية - كلمات متقاطعة - بحث عن الكلمات)
- استيراد المحتوى من PDF و Word
- بنك أسئلة واختبارات إلكترونية
- تصدير إلى Word و PowerPoint و PDF و Moodle و Google Forms
- واجهة عربية تفاعلية

## هيكل المشروع

```
ai-teacher/
├── backend/           # FastAPI Backend
│   ├── main.py        # نقطة الدخول
│   ├── config.py      # الإعدادات
│   ├── database.py    # قاعدة البيانات
│   ├── models/        # نماذج SQLAlchemy
│   ├── schemas/       # مخططات Pydantic
│   ├── routers/       # مسارات API
│   └── services/      # خدمات (AI - استيراد - تصدير)
├── frontend/          # Next.js Frontend
│   └── src/
│       ├── app/       # صفحات التطبيق
│       ├── components/# المكونات
│       ├── lib/       # المكتبات المساعدة
│       └── types/     # تعريفات TypeScript
└── README.md
```

## متطلبات التشغيل

- Python 3.10+
- Node.js 18+
- PostgreSQL

## تشغيل Backend

```bash
cd backend
pip install -r requirements.txt
# تأكد من تعديل .env بمفاتيح API
python -m uvicorn main:app --reload --port 8000
```

## تشغيل Frontend

```bash
cd frontend
npm install
npm run dev
```

## متغيرات البيئة

### backend/.env
- `DATABASE_URL` - رابط قاعدة PostgreSQL
- `OPENAI_API_KEY` - مفتاح OpenAI API
- `OPENAI_MODEL` - نموذج الذكاء الاصطناعي

### frontend/.env.local
- `NEXT_PUBLIC_API_URL` - رابط API (http://localhost:8000/api)

## التقنيات المستخدمة

- **Frontend:** React, Next.js 14, Tailwind CSS, TypeScript
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL
- **AI:** OpenAI API (GPT-4o)
- **Games:** تفاعلية كاملة بدون مكتبات خارجية (Drag & Drop, Timer, إلخ)
