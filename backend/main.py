from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, lessons, activities, games, generator, exams, reports, export

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Teacher Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(lessons.router, prefix="/api/lessons", tags=["Lessons"])
app.include_router(activities.router, prefix="/api/activities", tags=["Activities"])
app.include_router(games.router, prefix="/api/games", tags=["Games"])
app.include_router(generator.router, prefix="/api/generator", tags=["Generator"])
app.include_router(exams.router, prefix="/api/exams", tags=["Exams"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(export.router, prefix="/api/export", tags=["Export"])


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
