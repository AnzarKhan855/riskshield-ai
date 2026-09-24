from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Dict


class ModelIntegrityError(Exception):
    """Raised when model artifact integrity verification fails."""
    pass


@dataclass
class ModelArtifact:
    model_id: str
    model_type: str
    framework: str
    version: str
    artifact_instance: Any
    metadata: Any = None


class IModelLoader(ABC):
    @property
    @abstractmethod
    def framework_name(self) -> str:
        pass

    @abstractmethod
    def load_model(self, model_id: str, artifact_path: str) -> ModelArtifact:
        pass

    @abstractmethod
    def predict(self, artifact: ModelArtifact, features: Dict[str, Any]) -> Dict[str, Any]:
        pass
