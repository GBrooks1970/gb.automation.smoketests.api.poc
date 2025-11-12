@echo off
setlocal EnableDelayedExpansion

rem ---------------------------------------------------------------------------
rem Mirrors RUN_ALL_APIS_AND_SWAGGER.BAT structure:
rem   • env_utils.bat centralizes env/port logic
rem   • reusable helpers manage API lifecycle + test execution
rem   • pedagogical comments explain each major section
rem ---------------------------------------------------------------------------

set "SCRIPT_DIR=%~dp0"

pushd "%SCRIPT_DIR%.."
set "ROOT_DIR=%CD%"
set "RESULTS_DIR=%ROOT_DIR%\.results"
if not exist "%RESULTS_DIR%" mkdir "%RESULTS_DIR%" >nul 2>&1

set "PROJECT_DIR=%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP003_TYPESCRIPT_PLAYWRIGHT"
set "SUITE_LABEL=DEMOAPP003"
set "PID_FILE=%RESULTS_DIR%\demoapp003_api.pid"

rem Load port/base URL from env (matching RUN_ALL_APIS... behaviour)
call "%SCRIPT_DIR%env_utils.bat" load_env_vars "%PROJECT_DIR%" 3001 "http://localhost:3001" SERVER_PORT API_BASE_URL

rem Timestamped result file
for /f %%I in ('powershell -NoProfile -Command "(Get-Date).ToUniversalTime().ToString(\"yyyyMMddTHHmmZ\")"') do set "UTC_TIMESTAMP=%%I"
set "RESULT_LOG=%RESULTS_DIR%\demoapp003_typescript_playwright_%UTC_TIMESTAMP%.txt"

rem Start API host if needed
call "%SCRIPT_DIR%env_utils.bat" is_port_in_use %SERVER_PORT% PORT_IN_USE
if "%SKIP_API_START%"=="1" (
    echo SKIP_API_START set. Skipping %SUITE_LABEL% API start.
) else (
    if "%PORT_IN_USE%"=="1" (
        echo Port %SERVER_PORT% already in use. Attempting to reclaim it...
        call :free_port %SERVER_PORT%
        call "%SCRIPT_DIR%env_utils.bat" is_port_in_use %SERVER_PORT% PORT_IN_USE
        if "%PORT_IN_USE%"=="1" (
            echo Port %SERVER_PORT% is still busy. Skipping %SUITE_LABEL% API start.
            goto run_tests
        )
    )

    call :start_node_api "%SUITE_LABEL%" "%PROJECT_DIR%" %SERVER_PORT% API
    if errorlevel 1 (
        set "EXIT_CODE=1"
        goto cleanup
    )
    > "%PID_FILE%" echo !API_PID!

    rem Launch Swagger UI for consistency with the global runner
    powershell -NoProfile -Command "Start-Process('%API_BASE_URL%/swagger/v1/json')" >nul 2>&1
)

:run_tests

rem Run Playwright+Cucumber suite with summary appended to the log
call :run_playwright_suite "%PROJECT_DIR%" "%RESULT_LOG%"
set "EXIT_CODE=%ERRORLEVEL%"

:cleanup
if "%SKIP_API_START%"=="1" (
    set "API_PID="
) else (
    call :stop_process "%SUITE_LABEL% API" "!API_PID!"
    if exist "%PID_FILE%" del "%PID_FILE%" >nul 2>&1
)

if "%EXIT_CODE%"=="0" (
    echo(
    echo %SUITE_LABEL% TypeScript + Playwright tests completed successfully. Log: "%RESULT_LOG%"
) else (
    echo(
    echo %SUITE_LABEL% TypeScript + Playwright tests failed. See "%RESULT_LOG%"
)

popd
endlocal & exit /b %EXIT_CODE%

rem ---------------------------------------------------------------------------
rem Helper: start Node API (same design used in RUN_ALL_APIS_AND_SWAGGER.BAT)
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

rem Wait up to 30*2 seconds for the port to respond
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
rem Helper: run the Playwright+Cucumber suite and append summary output
rem ---------------------------------------------------------------------------
:run_playwright_suite
set "PROJECT_DIR=%~1"
set "LOG_FILE=%~2"

pushd "%PROJECT_DIR%"
echo Running Playwright BDD suite...
call node tooling/run-cucumber-with-summary.cjs > "%LOG_FILE%" 2>&1
set "RUN_EXIT=%ERRORLEVEL%"
popd
exit /b %RUN_EXIT%

rem ---------------------------------------------------------------------------
rem Helper: attempt to free a TCP port by terminating the owning process.
rem         Uses Get-NetTCPConnection when available and falls back to netstat.
rem ---------------------------------------------------------------------------
:free_port
set "PORT_TO_FREE=%~1"
set "PORT_PID="

if exist "%PID_FILE%" (
    set /p PORT_PID=<"%PID_FILE%"
    set "FROM_FILE=1"
) else (
    set "FROM_FILE="
)

if not defined PORT_PID (
    for /f "usebackq delims=" %%P in (
        `powershell -NoProfile -Command "($c = Get-NetTCPConnection -LocalPort %PORT_TO_FREE% -ErrorAction SilentlyContinue | Select-Object -First 1) | ForEach-Object { $_.OwningProcess }"`
    ) do set "PORT_PID=%%P"
    if "%PORT_PID%"=="0" set "PORT_PID="
)

if not defined PORT_PID (
    for /f "usebackq tokens=5" %%P in (
        `netstat -ano ^| findstr /R /C:":%PORT_TO_FREE% "`
    ) do (
        set "PORT_PID=%%P"
        if "%PORT_PID%"=="0" set "PORT_PID="
        goto stop_port_pid
    )
    goto :EOF
)

:stop_port_pid
if defined PORT_PID (
    echo %PORT_PID%| findstr /R "^[0-9][0-9]*$" >nul
    if not errorlevel 1 (
        echo Terminating process %PORT_PID% that was holding port %PORT_TO_FREE%...
        powershell -NoProfile -Command "try { Stop-Process -Id %PORT_PID% -Force -ErrorAction SilentlyContinue } catch {}" >nul 2>&1
        timeout /t 2 >nul
    ) else (
        set "PORT_PID="
    )
)
set "PORT_PID="
if defined FROM_FILE if exist "%PID_FILE%" del "%PID_FILE%" >nul 2>&1
goto :EOF
