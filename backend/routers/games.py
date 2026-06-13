from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from database import get_db
from models import Game
from schemas.game import GameResponse

router = APIRouter()


@router.get("/lesson/{lesson_id}", response_model=List[GameResponse])
def list_games(lesson_id: int, db: Session = Depends(get_db)):
    games = db.query(Game).filter(Game.lesson_id == lesson_id).all()
    result = []
    for g in games:
        result.append(GameResponse(
            id=g.id,
            lesson_id=g.lesson_id,
            game_type=g.game_type,
            config=json.loads(g.config),
            created_at=g.created_at
        ))
    return result


@router.get("/{game_id}", response_model=GameResponse)
def get_game(game_id: int, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="اللعبة غير موجودة")
    return GameResponse(
        id=game.id,
        lesson_id=game.lesson_id,
        game_type=game.game_type,
        config=json.loads(game.config),
        created_at=game.created_at
    )


@router.put("/{game_id}", response_model=GameResponse)
def update_game(game_id: int, config: dict, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="اللعبة غير موجودة")
    game.config = json.dumps(config, ensure_ascii=False)
    db.commit()
    db.refresh(game)
    return GameResponse(
        id=game.id,
        lesson_id=game.lesson_id,
        game_type=game.game_type,
        config=json.loads(game.config),
        created_at=game.created_at
    )
