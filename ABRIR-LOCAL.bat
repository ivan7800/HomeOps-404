@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>&1
if not errorlevel 1 goto :py
where python >nul 2>&1
if not errorlevel 1 goto :python
echo No se ha encontrado Python 3.
echo Instala Python o publica el contenido en GitHub Pages.
pause
exit /b 1
:py
start "HomeOps 404" "http://localhost:8080/"
py -m http.server 8080
exit /b
:python
start "HomeOps 404" "http://localhost:8080/"
python -m http.server 8080
exit /b
