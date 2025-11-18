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

set "EXIT_CODE=0"

echo === Running util tests (pytest -m util) ===
python -m pytest -m util
if errorlevel 1 (
    set "EXIT_CODE=1"
)

echo === Running API tests (pytest -m api) ===
python -m pytest -m api
if errorlevel 1 (
    set "EXIT_CODE=1"
)

popd
endlocal & exit /b %EXIT_CODE%
