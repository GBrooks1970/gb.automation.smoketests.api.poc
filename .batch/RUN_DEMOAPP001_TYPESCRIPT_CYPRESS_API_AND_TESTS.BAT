@echo off
setlocal EnableDelayedExpansion

rem ---------------------------------------------------------------------------
rem This script mirrors the structure of RUN_ALL_APIS_AND_SWAGGER.BAT:
rem   • shared helpers (env loading, port checks) live in env_utils.bat
rem   • API lifecycle management is centralized in :start_node_api / :stop_process
rem   • reusable :run_cypress_suite handles util + main specs with logging
rem ---------------------------------------------------------------------------

set "SCRIPT_DIR=%~dp0"

pushd "%SCRIPT_DIR%.."
set "ROOT_DIR=%CD%"
set "RESULTS_DIR=%ROOT_DIR%\.results"
if not exist "%RESULTS_DIR%" mkdir "%RESULTS_DIR%" >nul 2>&1

set "APP_DIR=%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP001_TYPESCRIPT_CYPRESS"
set "SUITE_LABEL=DEMOAPP001"

rem Load env vars (PORT/API_BASE_URL) just like RUN_ALL_APIS... helper does
call "%SCRIPT_DIR%env_utils.bat" load_env_vars "%APP_DIR%" 3000 "http://localhost:3000" SERVER_PORT API_BASE_URL

rem Timestamped log files for util + main suite
for /f %%I in ('powershell -NoProfile -Command "(Get-Date).ToUniversalTime().ToString(\"yyyyMMddTHHmmZ\")"') do set "UTC_TIMESTAMP=%%I"
set "API_LOG=%RESULTS_DIR%\demoapp001_typescript_cypress_%UTC_TIMESTAMP%.txt"
set "UTIL_LOG=%RESULTS_DIR%\demoapp001_typescript_cypress_util_%UTC_TIMESTAMP%.txt"

rem Start the API (unless port already occupied or SKIP_API_START set)
call "%SCRIPT_DIR%env_utils.bat" is_port_in_use %SERVER_PORT% PORT_IN_USE
if "%SKIP_API_START%"=="1" (
    echo SKIP_API_START set. Skipping %SUITE_LABEL% API start.
) else if "%PORT_IN_USE%"=="1" (
    echo Port %SERVER_PORT% already in use. Assuming %SUITE_LABEL% API is running.
) else (
    call :start_node_api "%SUITE_LABEL%" "%APP_DIR%" %SERVER_PORT% API
    if errorlevel 1 (
        set "EXIT_CODE=1"
        goto cleanup
    )

    rem Open Swagger for parity with RUN_ALL_APIS... behaviour
    powershell -NoProfile -Command "Start-Process('%API_BASE_URL%/swagger/v1/json')" >nul 2>&1
)

rem Run util specs first; keeping consistent structure while API is now guaranteed up.
call :run_cypress_suite "util" "%APP_DIR%" "%UTIL_LOG%" "cypress/integration/util-tests/**/*.feature"
if errorlevel 1 (
    echo %SUITE_LABEL% util tests failed. See "%UTIL_LOG%"
    set "EXIT_CODE=1"
    goto cleanup
)

rem Run full Cypress suite (logs go to API_LOG)
call :run_cypress_suite "main" "%APP_DIR%" "%API_LOG%" ""
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
    echo %SUITE_LABEL% TypeScript + Cypress tests completed successfully. Results:
    echo   API suite: "%API_LOG%"
    echo   Util suite: "%UTIL_LOG%"
) else (
    echo(
    echo %SUITE_LABEL% TypeScript + Cypress tests failed. See:
    echo   API suite: "%API_LOG%"
    echo   Util suite: "%UTIL_LOG%"
)

popd
endlocal & exit /b %EXIT_CODE%

rem ---------------------------------------------------------------------------
rem Helper: start a Node API (shared design from RUN_ALL_APIS_AND_SWAGGER.BAT)
rem ---------------------------------------------------------------------------
:start_node_api
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
    `powershell -NoProfile -Command "$p = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c','npm','run','start' -WorkingDirectory '%PROJECT_DIR%' -PassThru; $p.Id"`
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
rem Helper: run Cypress suite with optional spec filter and pedagogical comments
rem ---------------------------------------------------------------------------
:run_cypress_suite
set "SUITE_NAME=%~1"
set "PROJECT_DIR=%~2"
set "LOG_FILE=%~3"
set "SPEC_PATTERN=%~4"
set "PREV_ELECTRON_FLAG=%ELECTRON_RUN_AS_NODE%"

rem Cypress/Electron fails to boot if ELECTRON_RUN_AS_NODE=1, so temporarily clear it.
set "ELECTRON_RUN_AS_NODE="

pushd "%PROJECT_DIR%"
if "%SUITE_NAME%"=="util" (
    rem Run the util Scenario Outlines only (avoids API dependency)
    if defined SPEC_PATTERN (
        call npx cypress run --spec "%SPEC_PATTERN%" > "%LOG_FILE%" 2>&1
    ) else (
        call npx cypress run > "%LOG_FILE%" 2>&1
    )
) else (
    rem Run the full Cypress suite (API endpoints + util tags)
    if defined SPEC_PATTERN (
        call npx cypress run --spec "%SPEC_PATTERN%" > "%LOG_FILE%" 2>&1
    ) else (
        call npx cypress run > "%LOG_FILE%" 2>&1
    )
)
set "RUN_EXIT=%ERRORLEVEL%"
popd

rem Restore whatever ELECTRON_RUN_AS_NODE value the caller had (if any).
if defined PREV_ELECTRON_FLAG (
    set "ELECTRON_RUN_AS_NODE=%PREV_ELECTRON_FLAG%"
) else (
    set "ELECTRON_RUN_AS_NODE="
)
set "PREV_ELECTRON_FLAG="

exit /b %RUN_EXIT%
