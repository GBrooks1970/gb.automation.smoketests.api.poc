@echo off
setlocal EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%"

set "VENV_ACTIVATOR=%SCRIPT_DIR%.venv\Scripts\activate.bat"
if exist "%VENV_ACTIVATOR%" (
    call "%VENV_ACTIVATOR%"
) else (
    echo [WARN] Virtual environment not found (.venv). Continuing with system Python.
)

echo Starting FastAPI host...
python -m src.server

popd
endlocal
