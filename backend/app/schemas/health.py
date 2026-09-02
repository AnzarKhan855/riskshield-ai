from datetime import datetime
from pydantic import BaseModel, Field


class SystemHealthResponse(BaseModel):
    status: str = Field(..., example="ok")
    version: str = Field(..., example="0.1.0")
    database: str = Field(..., example="connected")
    redis: str = Field(..., example="connected")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
