<#
setup.ps1
Script sencillo para preparar el entorno de desarrollo (Windows PowerShell).

Uso:
  .\setup.ps1                # crea venv si no existe, instala deps y ejecuta migrate
  .\setup.ps1 -CreateSuperuser  # además intenta crear superuser interactivo

Nota: el script NO sube ni gestiona el venv en el repo; crea un venv local en `sandia\venv`.
#>

[CmdletBinding()]
param(
    [switch]$CreateSuperuser
)

function ExitOnError($msg) {
    Write-Host $msg -ForegroundColor Red
    exit 1
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    ExitOnError "Python no está en PATH. Instala Python 3.10+ y vuelve a ejecutar."
}

$venvPath = Join-Path -Path $root -ChildPath "sandia\venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "Creando entorno virtual en 'sandia\venv'..."
    python -m venv "sandia\venv" || ExitOnError "Error creando venv"
} else {
    Write-Host "Entorno virtual ya existe en 'sandia\venv' — se reutilizará."
}

Write-Host "Activando entorno virtual..."
& "${venvPath}\Scripts\Activate.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nota: si la ejecución de scripts está bloqueada, ejecuta:\n  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force" -ForegroundColor Yellow
}

Write-Host "Instalando dependencias (backend)..."
if (-not (Test-Path "sandia\requirements.txt")) {
    Write-Host "Aviso: 'sandia/requirements.txt' no existe. Asegúrate de instalar manualmente las dependencias." -ForegroundColor Yellow
} else {
    pip install --upgrade pip
    pip install -r "sandia\requirements.txt" || ExitOnError "Error instalando dependencias"
}

Write-Host "Ejecutando migraciones (Django)..."
Push-Location "sandia\eventos"
python manage.py migrate || ExitOnError "Error en migrate"
Pop-Location

if ($CreateSuperuser) {
    Write-Host "Creando superuser (modo interactivo)..."
    Push-Location "sandia\eventos"
    python manage.py createsuperuser || Write-Host "createsuperuser cancelado o falló." -ForegroundColor Yellow
    Pop-Location
}

Write-Host "Listo. Para ejecutar el servidor (backend):" -ForegroundColor Green
Write-Host "  cd sandia\eventos; .\..\venv\Scripts\Activate.ps1; python manage.py runserver"
Write-Host "Para frontend (Vite):" -ForegroundColor Green
Write-Host "  cd sandia-frontend; npm install; npm run dev"
