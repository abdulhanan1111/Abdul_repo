from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.services import ai_service

router = APIRouter(prefix="/ai", tags=["ai"])

from typing import List, Optional
from app import schemas

class AIQuery(BaseModel):
    query: str
    history: Optional[List[schemas.ChatMessage]] = []

class AIResponse(BaseModel):
    response: str

@router.post("/chat", response_model=AIResponse)
def chat_with_assistant(query_data: AIQuery, db: Session = Depends(get_db)):
    result_text = ai_service.process_query(query_data.query, db, history=query_data.history)
    return AIResponse(response=result_text)
