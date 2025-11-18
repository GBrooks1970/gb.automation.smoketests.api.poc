@echo off
setlocal EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"

pushd "%SCRIPT_DIR%.."
set "ROOT_DIR=%CD%"
set "RESULTS_DIR=%ROOT_DIR%\.results"
if not exist "%RESULTS_DIR%" mkdir "%RESULTS_DIR%" >nul 2>&1

set "APP_DIR=%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP004_PYTHON_PLAYWRIGHT"
set "SUITE_LABEL=DEMOAPP004"

call "%SCRIPT_DIR%env_utils.bat" load_env_vars "%APP_DIR%" 3002 "http://localhost:3002" SERVER_PORT API_BASE_URL

for /f %%I in ('powershell -NoProfile -Command "(Get-Date).ToUniversalTime().ToString(\"yyyyMMddTHHmmZ\")"') do set "UTC_TIMESTAMP=%%I"
set "API_LOG=%RESULTS_DIR%\demoapp004_python_playwright_%UTC_TIMESTAMP%.txt"
set "UTIL_LOG=%RESULTS_DIR%\demoapp004_python_playwright_util_%UTC_TIMESTAMP%.txt"

call :run_pytest "util" "%APP_DIR%" "%UTIL_LOG%" "util"
if errorlevel 1 (
    echo %SUITE_LABEL% util tests failed. See "%UTIL_LOG%"
    set "EXIT_CODE=1"
    goto cleanup
)

call "%SCRIPT_DIR%env_utils.bat" is_port_in_use %SERVER_PORT% PORT_IN_USE
if "%SKIP_API_START%"=="1" (
    echo SKIP_API_START set. Skipping %SUITE_LABEL% API start.
) else if "%PORT_IN_USE%"=="1" (
    echo Port %SERVER_PORT% already in use. Assuming %SUITE_LABEL% API is running.
) else (
    call :start_python_api "%SUITE_LABEL%" "%APP_DIR%" %SERVER_PORT% API
    if errorlevel 1 (
        set "EXIT_CODE=1"
        goto cleanup
    )
    powershell -NoProfile -Command "Start-Process('%API_BASE_URL%/docs')" >nul 2>&1
)

call :run_pytest "api" "%APP_DIR%" "%API_LOG%" "api"
set "EXIT_CODE=%ERRORLEVEL%"

:cleanup
if "%SKIP_API_START%"=="1" (
    set "API_PID="
) else (
    call :stop_process "%SUITE_LABEL% API" "!API_PID!"
)

if "%EXIT_CODE%"=="0" (
    echo(
    echo %SUITE_LABEL% Python + Playwright tests completed successfully. Results:
    echo   API suite: "%API_LOG%"
    echo   Util suite: "%UTIL_LOG%"
) else (
    echo(
    echo %SUITE_LABEL% Python + Playwright tests failed. See:
    echo   API suite: "%API_LOG%"
    echo   Util suite: "%UTIL_LOG%"
)

popd
endlocal & exit /b %EXIT_CODE%

:run_pytest
set "SUITE=%~1"
set "PROJECT_DIR=%~2"
set "LOG_FILE=%~3"
set "MARKER=%~4"

pushd "%PROJECT_DIR%"
if defined MARKER (
    call python -m pytest -m "%MARKER%" --maxfail=1 > "%LOG_FILE%" 2>&1
) else (
    call python -m pytest --maxfail=1 > "%LOG_FILE%" 2>&1
)
set "RUN_EXIT=%ERRORLEVEL%"
popd
exit /b %RUN_EXIT%

:start_python_api
set "LABEL=%~1"
set "PROJECT_DIR=%~2"
set "PORT=%~3"
set "PREFIX=%~4"

call "%SCRIPT_DIR%env_utils.bat" is_port_in_use %PORT% PORT_IN_USE
if "%PORT_IN_USE%"=="1" (
    echo Port %PORT% already in use. Assuming %LABEL% API is running.
    exit /b 0
)

for /f "usebackq" %%I in (
    `powershell -NoProfile -Command "$p = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c','python','-m','src.server' -WorkingDirectory '%PROJECT_DIR%' -PassThru; $p.Id"`
) do set "%PREFIX%_PID=%%I"
if not defined %PREFIX%_PID (
    echo Failed to start %LABEL% API.
    exit /b 1
)

powershell -NoProfile -Command "for($i=0;$i -lt 30;$i++){ if(Test-NetConnection -ComputerName 'localhost' -Port %PORT% -InformationLevel Quiet){ exit 0 } Start-Sleep -Seconds 2 }; exit 1"
if errorlevel 1 (
    echo %LABEL% API did not become ready before timeout.
    exit /b 1
)

echo %LABEL% API started (PID=!%PREFIX%_PID!) on port %PORT%.
exit /b 0

:stop_process
if "%~2"=="" goto :EOF
powershell -NoProfile -Command "try { Stop-Process -Id %~2 -Force -ErrorAction SilentlyContinue } catch {}" >nul 2>&1
echo Stopped %~1 (PID %~2).
goto :EOF
