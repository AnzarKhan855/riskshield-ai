from typing import Dict, List, Type
from app.domain.features.base import BaseFeatureStrategy


class FeatureRegistry:
    _strategies: Dict[str, BaseFeatureStrategy] = {}

    @classmethod
    def register(cls, strategy: BaseFeatureStrategy) -> None:
        cls._strategies[strategy.group_name] = strategy

    @classmethod
    def get_all_strategies(cls) -> List[BaseFeatureStrategy]:
        return list(cls._strategies.values())

    @classmethod
    def get_strategy(cls, group_name: str) -> BaseFeatureStrategy:
        if group_name not in cls._strategies:
            raise KeyError(f"Feature strategy for group '{group_name}' is not registered.")
        return cls._strategies[group_name]

    @classmethod
    def clear(cls) -> None:
        cls._strategies.clear()
