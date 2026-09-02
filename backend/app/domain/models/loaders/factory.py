from typing import Dict, Type
from app.domain.models.loaders.base import IModelLoader
from app.domain.models.loaders.implementations import (
    JoblibLoader,
    ONNXLoader,
    PyTorchLoader,
    XGBoostLoader,
)


class ModelLoaderFactory:
    _loaders: Dict[str, IModelLoader] = {}

    @classmethod
    def register_loader(cls, loader: IModelLoader) -> None:
        cls._loaders[loader.framework_name.lower()] = loader

    @classmethod
    def get_loader(cls, framework: str) -> IModelLoader:
        fw_key = framework.lower()
        if fw_key not in cls._loaders:
            # Fallback to XGBoostLoader if framework loader not explicitly registered
            return cls._loaders.get("xgboost", XGBoostLoader())
        return cls._loaders[fw_key]


# Register default framework loaders
ModelLoaderFactory.register_loader(XGBoostLoader())
ModelLoaderFactory.register_loader(ONNXLoader())
ModelLoaderFactory.register_loader(JoblibLoader())
ModelLoaderFactory.register_loader(PyTorchLoader())
