import json
import re
from typing import Optional
from openai import OpenAI
from config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


SYSTEM_PROMPT = """أنت خبير في تصميم الأنشطة التعليمية لمادة التربية الإسلامية.
مهمتك هي استخراج المحتوى التعليمي من النص وإنتاج أنشطة متنوعة بصيغة JSON دقيقة.

يجب أن يحتوي الـ JSON على المفاتيح التالية:
- lesson: عنوان الدرس
- mcq: مصفوفة من 10 أسئلة اختيار متعدد (question, choices[], answer)
- true_false: مصفوفة من 10 أسئلة صح وخطأ (question, answer: true/false, explanation)
- fill_blank: مصفوفة من 10 تمارين أكمل الفراغ (sentence, answer)
- flashcards: مصفوفة من 10 بطاقات تعليمية (front, back)
- matching: مصفوفة من 6-8 أزواج للمطابقة (left, right)
- ordering: مصفوفة من خطوات مرتبة (خطوة واحدة في كل عنصر)
- crossword: مصفوفة من 6-8 كلمات متقاطعة (word, clue)
- word_search: مصفوفة من 10-15 كلمة للبحث (word, term)
- question_bank: مصفوفة من 15 سؤالاً متنوعاً متنوعاً (type, question, options[], answer, difficulty)
- lesson_plan: {
    title, grade, objectives[], materials[], introduction, 
    steps[{order, duration, activity}], assessment, homework
  }

تأكد من:
- دقة المعلومات الشرعية
- مطابقة الأسئلة للمرحلة الدراسية
- تنوع مستويات الصعوبة
- أن تكون الإجابات صحيحة قطعاً"""


def _extract_json(text: str) -> dict:
    try:
        match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        return json.loads(text)
    except json.JSONDecodeError:
        raise ValueError("فشل في تحليل JSON من استجابة الذكاء الاصطناعي")


def generate_activities(
    title: str,
    grade: str,
    objectives: str,
    content: str,
    custom_prompt: Optional[str] = None
) -> dict:
    user_prompt = custom_prompt or f"""
عنوان الدرس: {title}
المرحلة الدراسية: {grade}
الأهداف التعليمية: {objectives}

محتوى الدرس:
{content}

قم بتوليد جميع الأنشطة التعليمية المطلوبة بصيغة JSON.
"""
    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7,
        max_tokens=8000,
        response_format={"type": "json_object"}
    )
    return _extract_json(response.choices[0].message.content)


def extract_from_pdf_text(text: str) -> dict:
    prompt = f"""
استخرج من النص التالي المعلومات التالية وأعدها بصيغة JSON:
- lesson_title: عنوان الدرس المقترح
- grade: المرحلة الدراسية المقترحة
- objectives: الأهداف التعليمية (مصفوفة)
- keywords: المصطلحات الشرعية الرئيسية (مصفوفة)
- summary: ملخص الدرس

النص:
{text}
"""
    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "أنت خبير في استخراج المعلومات من النصوص التعليمية الشرعية."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        response_format={"type": "json_object"}
    )
    return _extract_json(response.choices[0].message.content)


def generate_question_bank(
    title: str,
    grade: str,
    content: str,
    num_questions: int = 30
) -> list:
    prompt = f"""
بناءً على الدرس "{title}" للمرحلة {grade}، قم بتوليد {num_questions} سؤالاً متنوعاً (اختيار متعدد، صح وخطأ، أكمل الفراغ، مقابلة، مقالي).

المحتوى:
{content}

أعد النتيجة كمصفوفة JSON تحت المفتاح "questions".
كل سؤال له: type, question, options (إن وجد), answer, difficulty (easy/medium/hard)
"""
    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "أنت خبير في بناء بنوك الأسئلة للمواد الشرعية."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,
        response_format={"type": "json_object"}
    )
    result = _extract_json(response.choices[0].message.content)
    return result.get("questions", [])
