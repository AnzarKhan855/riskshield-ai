import json
import logging
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("riskshield.llm")


class LLMClient:
    """
    Enterprise LLM Client supporting Groq OpenAI-compatible API with
    graceful offline analytical fallback when API keys are not provided or API calls fail.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: str = "https://api.groq.com/openai/v1",
    ):
        self.api_key = api_key if api_key is not None else settings.GROQ_API_KEY
        self.model = model if model is not None else settings.GROQ_MODEL
        self.base_url = base_url.rstrip("/")

    @property
    def is_configured(self) -> bool:
        return bool(
            self.api_key
            and self.api_key.strip()
            and not self.api_key.startswith("gsk_your_groq")
        )

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 1024,
        json_mode: bool = False,
    ) -> Optional[str]:
        """
        Execute chat completion against Groq API if configured.
        Returns None if not configured or if API call fails (triggering analytical fallback).
        """
        if not self.is_configured:
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                if response.status_code == 200:
                    data = response.json()
                    choices = data.get("choices", [])
                    if choices and "message" in choices[0]:
                        return choices[0]["message"].get("content", "")
                else:
                    logger.warning(
                        f"Groq API returned status {response.status_code}: {response.text}"
                    )
        except Exception as e:
            logger.warning(f"Groq API completion failed with error: {str(e)}")

        return None


llm_client = LLMClient()
