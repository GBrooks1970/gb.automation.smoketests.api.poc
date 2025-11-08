@echo off
setlocal EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"

pushd "%SCRIPT_DIR%.."
set "ROOT_DIR=%CD%"
set "RESULTS_DIR=%ROOT_DIR%\.results"
if not exist "%RESULTS_DIR%" mkdir "%RESULTS_DIR%" >nul 2>&1

set "APP1_DIR=%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP001_TYPESCRIPT_CYPRESS"
set "APP3_DIR=%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP003_TYPESCRIPT_PLAYWRIGHT"
set "APP2_API_DIR=%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP002_CSHARP_PLAYWRIGHT\TokenParserAPI"

echo === Starting DEMOAPP001 TypeScript API ===
call :start_node_api "DEMOAPP001" "%APP1_DIR%" 3000 API1
if errorlevel 1 goto cleanup

echo === Starting DEMOAPP003 TypeScript API ===
call :start_node_api "DEMOAPP003" "%APP3_DIR%" 3001 API3
if errorlevel 1 goto cleanup

echo === Starting DEMOAPP002 C# API ===
call :start_dotnet_api "DEMOAPP002" "%APP2_API_DIR%" 5228 API2
if errorlevel 1 goto cleanup

echo.
echo All APIs are running. Press any key to stop them...
pause >nul

:cleanup
echo Stopping APIs...
call :stop_process "DEMOAPP001" "%API1_PID%"
call :stop_process "DEMOAPP003" "%API3_PID%"
call :stop_process "DEMOAPP002" "%API2_PID%"

popd
endlocal
exit /b 0

:start_node_api
rem %1 label, %2 project dir, %3 default port, %4 prefix
set "LABEL=%~1"
set "PROJECT_DIR=%~2"
set "DEFAULT_PORT=%~3"
set "PREFIX=%~4"

set "PORT_VAR=%PREFIX%_PORT"
set "BASE_VAR=%PREFIX%_BASE"
call "%SCRIPT_DIR%env_utils.bat" load_env_vars "%PROJECT_DIR%" %DEFAULT_PORT% "http://localhost:%DEFAULT_PORT%" %PORT_VAR% %BASE_VAR%

call set "CURRENT_PORT=%%%PORT_VAR%%%"
call set "CURRENT_BASE=%%%BASE_VAR%%%"

call "%SCRIPT_DIR%env_utils.bat" is_port_in_use %CURRENT_PORT% PORT_IN_USE
if "%PORT_IN_USE%"=="1" (
    echo Port %CURRENT_PORT% already in use. Assuming %LABEL% API is running.
    exit /b 0
)

for /f %%I in ('powershell -NoProfile -Command "$p = Start-Process -FilePath 'npm' -ArgumentList 'run','start' -WorkingDirectory '%PROJECT_DIR%' -PassThru; $p.Id"') do set "%PREFIX%_PID=%%I"
if not defined %PREFIX%_PID (
    echo Failed to start %LABEL% API.
    exit /b 1
)

call set "CURRENT_PID=%%%PREFIX%_PID%%%"

echo %LABEL% API started on port %CURRENT_PORT% (PID=%CURRENT_PID%).
start "" "%CURRENT_BASE%/swagger/v1/json"
exit /b 0

:start_dotnet_api
rem %1 label, %2 project dir, %3 port, %4 prefix
set "LABEL=%~1"
set "PROJECT_DIR=%~2"
set "PORT=%~3"
set "PREFIX=%~4"

call "%SCRIPT_DIR%env_utils.bat" is_port_in_use %PORT% PORT_IN_USE
if "%PORT_IN_USE%"=="1" (
    echo Port %PORT% already in use. Assuming %LABEL% API is running.
    exit /b 0
)

for /f %%I in ('powershell -NoProfile -Command "$p = Start-Process -FilePath 'dotnet' -ArgumentList 'run','--no-build','--project','%PROJECT_DIR%','--urls','http://localhost:%PORT%' -WorkingDirectory '%PROJECT_DIR%' -PassThru; $p.Id"') do set "%PREFIX%_PID=%%I"
if not defined %PREFIX%_PID (
    echo Failed to start %LABEL% API.
    exit /b 1
)

call set "CURRENT_PID=%%%PREFIX%_PID%%%"
echo %LABEL% API started on port %PORT% (PID=%CURRENT_PID%).
start "" "http://localhost:%PORT%/swagger"
exit /b 0

:stop_process
rem %1 label, %2 pid
if "%~2"=="" goto :EOF
powershell -NoProfile -Command "try { Stop-Process -Id %~2 -Force -ErrorAction SilentlyContinue } catch {}" >nul 2>&1
echo Stopped %~1 API (PID %~2).
goto :EOF
