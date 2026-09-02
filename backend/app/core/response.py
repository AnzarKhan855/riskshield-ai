from typing import Any, Dict, Generic, Optional, TypeVar
from pydantic import BaseModel, Field

DataType = TypeVar("DataType")


class APIResponse(BaseModel, Generic[DataType]):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[DataType] = None
    error: Optional[Dict[str, Any]] = None
    meta: Optional[Dict[str, Any]] = None


def success_response(
    data: Optional[Any] = None,
    message: str = "Operation completed successfully",
    meta: Optional[Dict[str, Any]] = None,
) -> APIResponse:
    return APIResponse(
        success=True,
        message=message,
        data=data,
        meta=meta,
    )


def error_response(
    message: str = "An error occurred",
    error_details: Optional[Dict[str, Any]] = None,
) -> APIResponse:
    return APIResponse(
        success=False,
        message=message,
        data=None,
        error=error_details,
    )
