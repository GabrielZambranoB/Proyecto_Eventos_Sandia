Guía Proyecto 
Este proyecto tiene dos partes:

Backend → Es el cerebro. Hecho en Django (Python).
Frontend → Es la cara bonita. Hecho en React (Vite).

El backend sirve datos.
El frontend muestra esos datos.
Se hablan por una URL.

Antes de empezar: ¿Qué necesitas instalado?

Python 3.10 o más nuevo
Node + npm
PostgreSQL 

1 INSTALAR Y LEVANTAR EL BACKEND (Django)
1.1. Entra a la carpeta del backend

Abre una terminal y muevete a la carpeta sandia:

cd sandia

1.2. Activa el entorno virtual (o créalo si no existe)

.\venv\Scripts\activate

Si te dice que no existe, créalo:

python -m venv venv
.\venv\Scripts\activate

Alternativamente, desde la raíz del proyecto puedes ejecutar `.\setup.ps1` para crear el entorno virtual, instalar dependencias y ejecutar las migraciones automáticamente.

1.3. Instala las dependencias (las librerías necesarias)
pip install -r requirements.txt

1.4. Entra al módulo principal del backend
cd eventos

1.5. Configurar la base de datos

Abre PgAdmin
Crea una base llamada sandia
Clic derecho → Restore
En Format, elige Directory
Selecciona la carpeta/archivo sandiaa.tar
Restaurar → Listo

Si usas Postgres, asegúrate de poner tu usuario/contraseña en settings.py:

'USER': 'postgres',
'PASSWORD': 'tu_clave',



1.6. Crear el usuario administrador (superuser)

Modo normal:
python manage.py createsuperuser

Modo automático (ya viene predefinido):
python manage.py shell -c "from django.contrib.auth import get_user_model; User=get_user_model(); User.objects.create_superuser('superadmin','superadmin@example.com','SuperAdmin2025!')"

1.7. Correr el servidor del backend
python manage.py runserver


Si ves algo como:
Starting development server at http://127.0.0.1:8000/

→ Felicitaciones, no rompiste nada.

2 INSTALAR Y LEVANTAR EL FRONTEND (React + Vite)
2.1. Abre otra terminal

Entra a la carpeta del frontend:

cd sandia-frontend

2.2. Instala dependencias
npm install

2.3. Corre el frontend
npm run dev


Te saldrá algo como:

http://localhost:5173


Entra ahí → debería aparecer tu app.

Conexión frontend → backend

En la carpeta sandia-frontend debe existir un archivo .env con algo como:

VITE_API_URL=http://127.0.0.1:8000/api


Esto le dice al frontend a dónde llamar.

3 USAR POSTMAN (para probar la API)
Login:

POST a:

{{base_url}}/api/token/


Body:

{
  "username": "admin",
  "password": "tu_pass"
}


Te devuelve:

access
refresh

Para rutas protegidas:

Poner en headers:
Authorization: Bearer TU_ACCESS_TOKEN