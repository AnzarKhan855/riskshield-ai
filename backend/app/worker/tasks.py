import logging
from app.core.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.worker.sample_background_task")
def sample_background_task(task_name: str) -> dict:
    """
    Sample Celery background task placeholder for system verification.
    """
    logger.info(f"Executing background task: {task_name}")
    return {"task": task_name, "status": "completed"}
