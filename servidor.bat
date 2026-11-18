@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
cd /d "%ROOT_DIR%"

set "HOST=127.0.0.1"
set "PORT=5173"
set "SERVER_URL=http://%HOST%:%PORT%"
set "WINDOW_TITLE=La Rosca - Vite Dev Server (%PORT%)"

call :check_tooling
if errorlevel 1 exit /b 1

if /i "%~1"=="install" (
    call :install_deps
    exit /b %errorlevel%
)
if /i "%~1"=="start" (
    call :start_server
    exit /b %errorlevel%
)
if /i "%~1"=="stop" (
    call :stop_server
    exit /b %errorlevel%
)
if /i "%~1"=="status" (
    call :show_status
    exit /b %errorlevel%
)
if not "%~1"=="" (
    echo Uso: %~nx0 [install^|start^|stop^|status]
    exit /b 1
)

:menu
cls
echo ====================================================
echo   LA ROSCA - Control de Servidor y Dependencias
echo ====================================================
echo   Carpeta: %ROOT_DIR%
echo   URL:     %SERVER_URL%
echo.
call :show_status
echo.
echo   [1] Instalar dependencias (npm install)
echo   [2] Iniciar servidor
echo   [3] Parar servidor
echo   [4] Actualizar estado
echo   [0] Salir
echo ====================================================
set "CHOICE="
set /p "CHOICE=Elegi una opcion [0-4]: "

if "%CHOICE%"=="1" (
    call :install_deps
    pause
    goto menu
)
if "%CHOICE%"=="2" (
    call :start_server
    pause
    goto menu
)
if "%CHOICE%"=="3" (
    call :stop_server
    pause
    goto menu
)
if "%CHOICE%"=="4" goto menu
if "%CHOICE%"=="0" exit /b 0

echo.
echo Opcion invalida.
ping -n 2 127.0.0.1 >nul
goto menu

:check_tooling
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] No se encontro Node.js en el PATH.
    exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] No se encontro npm en el PATH.
    exit /b 1
)
exit /b 0

:get_listening_pid
set "SERVER_PID="
for /f "tokens=5" %%P in ('netstat -ano 2^>nul ^| findstr /R /C:":%PORT% .*LISTENING"') do (
    set "SERVER_PID=%%P"
    goto :eof
)
goto :eof

:show_status
call :get_listening_pid
if defined SERVER_PID (
    echo   Estado:  ACTIVO ^(PID %SERVER_PID% en puerto %PORT%^)
) else (
    echo   Estado:  DETENIDO ^(puerto %PORT% libre^)
)
exit /b 0

:install_deps
echo.
echo [INFO] Instalando dependencias en el workspace...
call npm install
if errorlevel 1 (
    echo [ERROR] Fallo npm install.
    exit /b 1
)
echo [OK] Dependencias instaladas correctamente.
exit /b 0

:start_server
echo.
call :get_listening_pid
if defined SERVER_PID (
    echo [INFO] El servidor ya esta corriendo ^(PID %SERVER_PID%^) en %SERVER_URL%
    exit /b 0
)

if not exist "%ROOT_DIR%\node_modules" (
    echo [INFO] No existe node_modules. Instalando dependencias primero...
    call :install_deps
    if errorlevel 1 exit /b 1
)

echo [INFO] Iniciando servidor de desarrollo en %SERVER_URL%...
start "%WINDOW_TITLE%" /D "%ROOT_DIR%" cmd /k "npm run dev"

set /a WAIT_COUNT=0
:wait_loop
call :get_listening_pid
if defined SERVER_PID (
    echo [OK] Servidor iniciado ^(PID %SERVER_PID%^) en %SERVER_URL%
    exit /b 0
)
set /a WAIT_COUNT+=1
if %WAIT_COUNT% GEQ 15 (
    echo [AVISO] La ventana del servidor se abrio, pero el puerto %PORT% todavia no responde.
    exit /b 0
)
ping -n 2 127.0.0.1 >nul
goto wait_loop

:stop_server
echo.
set "STOPPED=0"

for /f "tokens=5" %%P in ('netstat -ano 2^>nul ^| findstr /R /C:":%PORT% .*LISTENING"') do (
    echo [INFO] Deteniendo proceso en puerto %PORT% ^(PID %%P^)...
    taskkill /PID %%P /T /F >nul 2>&1
    set "STOPPED=1"
)

taskkill /FI "WINDOWTITLE eq %WINDOW_TITLE%*" /T /F >nul 2>&1
if not errorlevel 1 set "STOPPED=1"

ping -n 2 127.0.0.1 >nul
call :get_listening_pid
if defined SERVER_PID (
    echo [ERROR] No se pudo detener el proceso PID %SERVER_PID% en puerto %PORT%.
    exit /b 1
)

if "%STOPPED%"=="1" (
    echo [OK] Servidor detenido y puerto %PORT% liberado.
) else (
    echo [INFO] No habia ningun servidor escuchando en el puerto %PORT%.
)
exit /b 0
