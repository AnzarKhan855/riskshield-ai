from typing import List, Union
from fastapi import Depends
from app.core.deps import get_current_active_user
from app.core.exceptions import AuthorizationException
from app.models.user import User, UserRole


class RoleChecker:
    """
    Role-Based Access Control (RBAC) dependency enforcement.
    Usage: Depends(RoleChecker([UserRole.ADMIN, UserRole.ANALYST]))
    """

    def __init__(self, allowed_roles: List[Union[UserRole, str]]):
        self.allowed_roles = [
            r.value if isinstance(r, UserRole) else r for r in allowed_roles
        ]

    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role.value not in self.allowed_roles:
            raise AuthorizationException(
                f"Role '{current_user.role.value}' is not permitted to perform this operation."
            )
        return current_user


def require_roles(*roles: Union[UserRole, str]) -> RoleChecker:
    """Helper factory for RBAC route protection."""
    return RoleChecker(list(roles))
