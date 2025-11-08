@echo off
setlocal EnableDelayedExpansion

pushd "%~dp0.."
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

set "%PREFIX%_PORT="
set "%PREFIX%_BASE="
set "ENV_FILE=%PROJECT_DIR%\.env"
if not exist "%ENV_FILE%" set "ENV_FILE=%PROJECT_DIR%\.env.example"

for /f "usebackq tokens=1* delims==" %%A in (`powershell -NoProfile -Command "$envFile = '%ENV_FILE%'; if (Test-Path $envFile) { Get-Content -LiteralPath $envFile | Where-Object {$_ -match '^(PORT|API_BASE_URL)='} | ForEach-Object { $_.Trim() } }"`) do (
    if /I "%%A"=="PORT" set "%PREFIX%_PORT=%%B"
    if /I "%%A"=="API_BASE_URL" set "%PREFIX%_BASE=%%B"
)

if not defined %PREFIX%_PORT set "%PREFIX%_PORT=%DEFAULT_PORT%"
if not defined %PREFIX%_BASE set "%PREFIX%_BASE=http://localhost:%DEFAULT_PORT%"

for /f %%I in ('powershell -NoProfile -Command "$p = Start-Process -FilePath 'npm' -ArgumentList 'run','start' -WorkingDirectory '%PROJECT_DIR%' -PassThru; $p.Id"') do set "%PREFIX%_PID=%%I"
if not defined %PREFIX%_PID (
    echo Failed to start %LABEL% API.
    exit /b 1
)

call set "CURRENT_PORT=%%%PREFIX%_PORT%%%"
call set "CURRENT_BASE=%%%PREFIX%_BASE%%%"
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
