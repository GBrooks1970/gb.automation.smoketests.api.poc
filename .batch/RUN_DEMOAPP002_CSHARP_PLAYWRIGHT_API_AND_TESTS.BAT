@echo off
setlocal EnableDelayedExpansion

rem ---------------------------------------------------------------------------
rem Mirrors RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT structure:
rem   - env_utils.bat loads shared env + port defaults
rem   - util SpecFlow tests (TestCategory=utiltests) run first to fail fast
rem   - main API SpecFlow tests run after the service is confirmed online
rem ---------------------------------------------------------------------------

set "SCRIPT_DIR=%~dp0"

pushd "%SCRIPT_DIR%.."
set "ROOT_DIR=%CD%"
set "RESULTS_DIR=%ROOT_DIR%\.results"
if not exist "%RESULTS_DIR%" mkdir "%RESULTS_DIR%" >nul 2>&1

set "APP_DIR=%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP002_CSHARP_PLAYWRIGHT"
set "API_DIR=%APP_DIR%\TokenParserAPI"
set "TEST_DIR=%APP_DIR%\TokenParserTests"
set "SUITE_LABEL=DEMOAPP002"

rem Load env vars for parity with other runners (defaults to port 5228)
call "%SCRIPT_DIR%env_utils.bat" load_env_vars "%API_DIR%" 5228 "http://localhost:5228" SERVER_PORT API_BASE_URL

rem Timestamped log files for util + main suites
for /f %%I in ('powershell -NoProfile -Command "(Get-Date).ToUniversalTime().ToString(\"yyyyMMddTHHmmZ\")"') do set "UTC_TIMESTAMP=%%I"
set "API_LOG=%RESULTS_DIR%\demoapp002_csharp_playwright_%UTC_TIMESTAMP%.txt"
set "UTIL_LOG=%RESULTS_DIR%\demoapp002_csharp_playwright_util_%UTC_TIMESTAMP%.txt"

rem Start the API (unless port already occupied or SKIP_API_START set)
call "%SCRIPT_DIR%env_utils.bat" is_port_in_use %SERVER_PORT% PORT_IN_USE
if "%SKIP_API_START%"=="1" (
    echo SKIP_API_START set. Skipping %SUITE_LABEL% API start.
) else if "%PORT_IN_USE%"=="1" (
    echo Port %SERVER_PORT% already in use. Assuming %SUITE_LABEL% API is running.
) else (
    call :start_dotnet_api "%SUITE_LABEL%" "%API_DIR%" %SERVER_PORT% API
    if errorlevel 1 (
        set "EXIT_CODE=1"
        goto cleanup
    )

    rem Launch Swagger UI to mimic the global runner behaviour
    powershell -NoProfile -Command "Start-Process('%API_BASE_URL%/swagger')" >nul 2>&1
)

rem Run util-only tests first (category filter avoids API dependency)
call :run_dotnet_tests "util" "%TEST_DIR%" "%UTIL_LOG%" "TestCategory=utiltests"
if errorlevel 1 (
    echo %SUITE_LABEL% util tests failed. See "%UTIL_LOG%"
    set "EXIT_CODE=1"
    goto cleanup
)

rem Ensure Playwright dependencies are installed before API-focused specs
call :ensure_playwright_install "%TEST_DIR%"
if errorlevel 1 (
    set "EXIT_CODE=1"
    goto cleanup
)

rem Run the full API + UI SpecFlow suite (includes API endpoints)
call :run_dotnet_tests "main" "%TEST_DIR%" "%API_LOG%" ""
set "EXIT_CODE=%ERRORLEVEL%"

:cleanup
rem Stop API if we launched it
if "%SKIP_API_START%"=="1" (
    set "API_PID="
) else (
    call :stop_process "%SUITE_LABEL% API" "!API_PID!"
)

if "%EXIT_CODE%"=="0" (
    echo(
    echo %SUITE_LABEL% C# + Playwright tests completed successfully. Results:
    echo   API suite: "%API_LOG%"
    echo   Util suite: "%UTIL_LOG%"
) else (
    echo(
    echo %SUITE_LABEL% C# + Playwright tests failed. See:
    echo   API suite: "%API_LOG%"
    echo   Util suite: "%UTIL_LOG%"
)

popd
endlocal & exit /b %EXIT_CODE%

rem ---------------------------------------------------------------------------
rem Helper: start dotnet API (mirrors RUN_ALL_APIS_AND_SWAGGER.BAT pattern)
rem ---------------------------------------------------------------------------
:start_dotnet_api
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
    `powershell -NoProfile -Command "$p = Start-Process -FilePath 'dotnet' -ArgumentList 'run','--no-build','--project','%PROJECT_DIR%','--urls','http://localhost:%PORT%' -WorkingDirectory '%PROJECT_DIR%' -PassThru; $p.Id"`
) do set "%PREFIX%_PID=%%I"
if not defined %PREFIX%_PID (
    echo Failed to start %LABEL% API.
    exit /b 1
)

rem Wait for port readiness
powershell -NoProfile -Command "for($i=0;$i -lt 30;$i++){ if(Test-NetConnection -ComputerName 'localhost' -Port %PORT% -InformationLevel Quiet){ exit 0 } Start-Sleep -Seconds 2 }; exit 1"
if errorlevel 1 (
    echo %LABEL% API did not become ready before timeout.
    exit /b 1
)

echo %LABEL% API started (PID=!%PREFIX%_PID!) on port %PORT%.
exit /b 0

rem ---------------------------------------------------------------------------
rem Helper: stop a process gracefully
rem ---------------------------------------------------------------------------
:stop_process
if "%~2"=="" goto :EOF
powershell -NoProfile -Command "try { Stop-Process -Id %~2 -Force -ErrorAction SilentlyContinue } catch {}" >nul 2>&1
echo Stopped %~1 (PID %~2).
goto :EOF

rem ---------------------------------------------------------------------------
rem Helper: run dotnet test with optional filter and tagged context
rem ---------------------------------------------------------------------------
:run_dotnet_tests
set "SUITE_NAME=%~1"
set "PROJECT_DIR=%~2"
set "LOG_FILE=%~3"
set "FILTER=%~4"

pushd "%PROJECT_DIR%"
if "%FILTER%"=="" (
    call dotnet test --no-build > "%LOG_FILE%" 2>&1
) else (
    call dotnet test --no-build --filter "%FILTER%" > "%LOG_FILE%" 2>&1
)
set "RUN_EXIT=%ERRORLEVEL%"
popd
exit /b %RUN_EXIT%

rem ---------------------------------------------------------------------------
rem Helper: ensure Playwright browsers/drivers are installed
rem ---------------------------------------------------------------------------
:ensure_playwright_install
set "TEST_DIR=%~1"

set "SCRIPT_PATH=%TEST_DIR%\..\playwright.ps1"
if not exist "%SCRIPT_PATH%" (
    set "SCRIPT_PATH=%TEST_DIR%\..\bin\Debug\net8.0\playwright.ps1"
)

if exist "%SCRIPT_PATH%" (
    echo Ensuring Playwright dependencies are installed...
    powershell -NoProfile -Command "Try { & '%SCRIPT_PATH%' install > $null 2>&1 } Catch { Write-Error 'Playwright install failed.'; exit 1 }"
    exit /b %ERRORLEVEL%
) else (
    echo Playwright installation script not found; skipping dependency check.
    exit /b 0
)
