@echo off
setlocal EnableDelayedExpansion

rem ---------------------------------------------------------------------------
rem Mirrors RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT structure:
rem   - env_utils.bat provides env + port helpers
rem   - util BDD specs run first (tagged @UTILTEST) to fail fast
rem   - main suite runs afterward, with API lifecycle fully managed here
rem ---------------------------------------------------------------------------

set "SCRIPT_DIR=%~dp0"

pushd "%SCRIPT_DIR%.."
set "ROOT_DIR=%CD%"
set "RESULTS_DIR=%ROOT_DIR%\.results"
if not exist "%RESULTS_DIR%" mkdir "%RESULTS_DIR%" >nul 2>&1

set "APP_DIR=%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP003_TYPESCRIPT_PLAYWRIGHT"
set "SUITE_LABEL=DEMOAPP003"

rem Load env vars (PORT/API_BASE_URL) for parity with other runners
call "%SCRIPT_DIR%env_utils.bat" load_env_vars "%APP_DIR%" 3001 "http://localhost:3001" SERVER_PORT API_BASE_URL

rem Timestamped log files for util + main suite
for /f %%I in ('powershell -NoProfile -Command "(Get-Date).ToUniversalTime().ToString(\"yyyyMMddTHHmmZ\")"') do set "UTC_TIMESTAMP=%%I"
set "API_LOG=%RESULTS_DIR%\demoapp003_typescript_playwright_%UTC_TIMESTAMP%.txt"
set "UTIL_LOG=%RESULTS_DIR%\demoapp003_typescript_playwright_util_%UTC_TIMESTAMP%.txt"

rem Start the API (unless port already occupied or SKIP_API_START set)
call "%SCRIPT_DIR%env_utils.bat" is_port_in_use %SERVER_PORT% PORT_IN_USE
if "%SKIP_API_START%"=="1" (
    echo SKIP_API_START set. Skipping %SUITE_LABEL% API start.
) else if "%PORT_IN_USE%"=="1" (
    echo Port %SERVER_PORT% already in use. Assuming %SUITE_LABEL% API is running.
) else (
    call :start_shared_api "%SUITE_LABEL%" "%ROOT_DIR%" %SERVER_PORT% API
    if errorlevel 1 (
        set "EXIT_CODE=1"
        goto cleanup
    )

    rem Open Swagger for parity with RUN_ALL_APIS... behaviour
    powershell -NoProfile -Command "Start-Process('%API_BASE_URL%/swagger/v1/json')" >nul 2>&1
)

rem Run util-tagged specs first; they stress Token Parsers without API calls.
call :run_playwright_suite "util" "%APP_DIR%" "%UTIL_LOG%" "@UTILTEST"
if errorlevel 1 (
    echo %SUITE_LABEL% util tests failed. See "%UTIL_LOG%"
    set "EXIT_CODE=1"
    goto cleanup
)

rem Run full Playwright + Cucumber suite (logs go to API_LOG)
call :run_playwright_suite "main" "%APP_DIR%" "%API_LOG%" ""
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
    echo %SUITE_LABEL% TypeScript + Playwright tests completed successfully. Results:
    echo   API suite: "%API_LOG%"
    echo   Util suite: "%UTIL_LOG%"
) else (
    echo(
    echo %SUITE_LABEL% TypeScript + Playwright tests failed. See:
    echo   API suite: "%API_LOG%"
    echo   Util suite: "%UTIL_LOG%"
)

popd
endlocal & exit /b %EXIT_CODE%

:start_shared_api
set "LABEL=%~1"
set "ROOT_PATH=%~2"
set "PORT=%~3"
set "PREFIX=%~4"

call "%SCRIPT_DIR%env_utils.bat" is_port_in_use %PORT% PORT_IN_USE
if "%PORT_IN_USE%"=="1" (
    echo Port %PORT% already in use. Assuming %LABEL% API is running.
    exit /b 0
)

for /f "usebackq" %%I in (
    `powershell -NoProfile -Command "$p = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c','node','packages/tokenparser-api-shared/dist/cli/start.js','--port','%PORT%','--label','%LABEL%' -WorkingDirectory '%ROOT_PATH%' -PassThru; $p.Id"`
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
rem Helper: run Playwright+Cucumber suite with optional tag filters.
rem ---------------------------------------------------------------------------
:run_playwright_suite
set "SUITE_NAME=%~1"
set "PROJECT_DIR=%~2"
set "LOG_FILE=%~3"
set "TAG_EXPRESSION=%~4"

pushd "%PROJECT_DIR%"
if defined TAG_EXPRESSION (
    rem Allow targeted runs (e.g., @UTILTEST) without editing package scripts.
    call node tooling/run-cucumber-with-summary.cjs --tags "%TAG_EXPRESSION%" > "%LOG_FILE%" 2>&1
) else (
    rem Run the full Cucumber-powered suite across API + util specs.
    call node tooling/run-cucumber-with-summary.cjs > "%LOG_FILE%" 2>&1
)
set "RUN_EXIT=%ERRORLEVEL%"
popd
exit /b %RUN_EXIT%
