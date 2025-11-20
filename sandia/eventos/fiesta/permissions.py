from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """Permiso que permite lectura a cualquiera autenticado (o no),
    pero sólo permite métodos no seguros a usuarios staff (administradores).

    SAFE_METHODS (GET, HEAD, OPTIONS) están permitidos para todos.
    Métodos de modificación (POST/PUT/PATCH/DELETE) requieren `is_staff`.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser))
