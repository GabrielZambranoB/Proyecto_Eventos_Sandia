from django.http import HttpResponse

def home(request):
    return HttpResponse("Bienvenido al sistema de eventos y fiestas 🎉")


from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import (
    RegistroUsuario, Promocion, Categoria, Servicio, Combo, ComboServicio,
    HorarioDisponible, Reserva, DetalleReserva, Pago, Cancelacion
)
from .serializers import (
    RegistroUsuarioSerializer, PromocionSerializer, CategoriaSerializer,
    ServicioSerializer, ComboDetailSerializer, HorarioDisponibleSerializer,
    ReservaSerializer, DetalleReservaSerializer, PagoSerializer, CancelacionSerializer,
    ComboServicioSerializer
)
from .permissions import IsAdminOrReadOnly


class RegistroUsuarioViewSet(viewsets.ModelViewSet):
    queryset = RegistroUsuario.objects.all()
    serializer_class = RegistroUsuarioSerializer
    def get_permissions(self):
        # Permitir creación pública (registro) pero proteger otras acciones
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer


class PromocionViewSet(viewsets.ModelViewSet):
    queryset = Promocion.objects.all()
    serializer_class = PromocionSerializer
    permission_classes = [IsAdminOrReadOnly]


class HorarioDisponibleViewSet(viewsets.ModelViewSet):
    queryset = HorarioDisponible.objects.all()
    serializer_class = HorarioDisponibleSerializer


class PagoViewSet(viewsets.ModelViewSet):
    queryset = Pago.objects.all()
    serializer_class = PagoSerializer
    permission_classes = [IsAdminOrReadOnly]


class CancelacionViewSet(viewsets.ModelViewSet):
    queryset = Cancelacion.objects.all()
    serializer_class = CancelacionSerializer
    permission_classes = [IsAdminOrReadOnly]


class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicio.objects.select_related('categoria').all()
    serializer_class = ServicioSerializer


class ComboServicioViewSet(viewsets.ModelViewSet):
    queryset = ComboServicio.objects.select_related('combo', 'servicio').all()
    serializer_class = ComboServicioSerializer
    permission_classes = [IsAdminOrReadOnly]


class ComboViewSet(viewsets.ModelViewSet):
    queryset = Combo.objects.select_related('promocion').prefetch_related('servicios').all()
    serializer_class = ComboDetailSerializer
    permission_classes = [IsAdminOrReadOnly]


class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.select_related('cliente', 'horario').all()
    serializer_class = ReservaSerializer


class DetalleReservaViewSet(viewsets.ModelViewSet):
    queryset = DetalleReserva.objects.select_related('reserva', 'combo', 'servicio').all()
    serializer_class = DetalleReservaSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    """Devuelve información básica del usuario autenticado."""
    User = get_user_model()
    user = request.user
    data = {
        'username': user.username,
        'email': user.email,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
    }
    # intentar obtener perfil en RegistroUsuario por email
    try:
        perfil = RegistroUsuario.objects.filter(email=user.email).first()
        if perfil:
            data.update({
                'nombre': perfil.nombre,
                'apellido': perfil.apellido,
                'telefono': perfil.telefono,
            })
    except Exception:
        pass
    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """Registro de nuevo usuario: crea Django User (sin privilegios) y RegistroUsuario."""
    User = get_user_model()
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    nombre = request.data.get('nombre')
    apellido = request.data.get('apellido')
    telefono = request.data.get('telefono')

    if not username or not password or not email:
        return Response({'detail': 'username, password y email son requeridos.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'detail': 'username ya existe.'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({'detail': 'email ya existe.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create(username=username, email=email, is_staff=False, is_superuser=False)
    user.set_password(password)
    user.save()

    # crear perfil RegistroUsuario (no guarda contrasena segura en ese modelo)
    try:
        RegistroUsuario.objects.create(
            nombre=nombre or '',
            apellido=apellido or '',
            telefono=telefono or '',
            email=email,
            contrasena='',
            activo=True
        )
    except Exception:
        # si falla el perfil, eliminamos el usuario creado para mantener consistencia
        user.delete()
        return Response({'detail': 'No se pudo crear el perfil.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'detail': 'Usuario creado correctamente.'}, status=status.HTTP_201_CREATED)
