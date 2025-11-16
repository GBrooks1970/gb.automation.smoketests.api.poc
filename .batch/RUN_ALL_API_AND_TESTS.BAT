@echo off
setlocal EnableDelayedExpansion

rem ---------------------------------------------------------------------------
rem RUN_ALL_API_AND_TESTS orchestrates the three per-project runners so that
rem  1) each stack uses its dedicated script (already aligned to RUN_ALL_APIS structure)
rem  2) shared helpers (env_utils, log discovery) are reused
rem  3) the output clearly reports what passed/failed
rem Pedagogical comments below explain each major step.
rem ---------------------------------------------------------------------------

pushd "%~dp0"
set "BATCH_DIR=%CD%"
set "SCRIPT_DIR=%CD%"
set "PUSHED_ROOT=0"

rem Ensure all per-project runners exist before we try to orchestrate them.
if not exist "%BATCH_DIR%\RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT" (
    echo [ERROR] Missing RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT in "%BATCH_DIR%".
    goto fail
)

if not exist "%BATCH_DIR%\RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT" (
    echo [ERROR] Missing RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT in "%BATCH_DIR%".
    goto fail
)

if not exist "%BATCH_DIR%\RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT" (
    echo [ERROR] Missing RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT in "%BATCH_DIR%".
    goto fail
)

if not exist "%BATCH_DIR%\RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT" (
    echo [ERROR] Missing RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT in "%BATCH_DIR%".
    goto fail
)

rem Align root + results folder with other scripts.
pushd ".."
set "ROOT_DIR=%CD%"
set "RESULT_DIR=%ROOT_DIR%\.results"
set "PUSHED_ROOT=1"

if not exist "%RESULT_DIR%" (
    mkdir "%RESULT_DIR%" >nul 2>&1
)

for /f %%I in ('powershell -NoProfile -Command "(Get-Date).ToUniversalTime().ToString(\"yyyyMMddTHHmmZ\")"') do set "RUN_UTC=%%I"
set "METRICS_RAW=%RESULT_DIR%\run_metrics_%RUN_UTC%.metrics"
set "METRICS_FILE=%RESULT_DIR%\run_metrics_%RUN_UTC%.txt"
set "METRICS_MD=%RESULT_DIR%\run_metrics_%RUN_UTC%.md"
> "%METRICS_RAW%" echo RUN UTC: %RUN_UTC%

set "TS_SCRIPT=%BATCH_DIR%\RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT"
set "CS_SCRIPT=%BATCH_DIR%\RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT"
set "PW_SCRIPT=%BATCH_DIR%\RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT"
set "PY_SCRIPT=%BATCH_DIR%\RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT"

set "APP1_DIR=%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP001_TYPESCRIPT_CYPRESS"
set "APP3_DIR=%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP003_TYPESCRIPT_PLAYWRIGHT"
set "APP4_DIR=%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP004_PYTHON_PLAYWRIGHT"

set "OVERALL_EXIT=0"

rem --- DEMOAPP001: Cypress stack ------------------------------------------------
echo === Running TypeScript API and Cypress tests ===
set "TS_BEFORE="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -File "%BATCH_DIR%\.ps\get-latest-log.ps1" -Directory "%RESULT_DIR%" -Filter "demoapp001_typescript_cypress_*.txt"`) do set "TS_BEFORE=%%I"
call "%SCRIPT_DIR%\env_utils.bat" load_env_vars "%APP1_DIR%" 3000 "http://localhost:3000" APP1_PORT APP1_BASE >nul
call "%SCRIPT_DIR%\env_utils.bat" is_port_in_use !APP1_PORT! APP1_PORT_BUSY >nul
if "!APP1_PORT_BUSY!"=="1" (
    rem If port already used we tell the child runner to skip API startup.
    set "SKIP_API_START=1"
    echo Port !APP1_PORT! already in use. Skipping DEMOAPP001 API start.
) else (
    set "SKIP_API_START="
)
call "%TS_SCRIPT%"
set "TS_EXIT=%ERRORLEVEL%"
set "SKIP_API_START="
set "TS_AFTER="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -File "%BATCH_DIR%\.ps\get-latest-log.ps1" -Directory "%RESULT_DIR%" -Filter "demoapp001_typescript_cypress_*.txt"`) do set "TS_AFTER=%%I"
call :report_result "Cypress" "%RESULT_DIR%" "%TS_BEFORE%" "%TS_AFTER%" "%TS_EXIT%"
if not "%TS_EXIT%"=="0" set "OVERALL_EXIT=1"

rem --- DEMOAPP003: Playwright TypeScript stack ----------------------------------
echo.
echo === Running TypeScript API and Playwright BDD tests ===
set "PW_BEFORE="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -File "%BATCH_DIR%\.ps\get-latest-log.ps1" -Directory "%RESULT_DIR%" -Filter "demoapp003_typescript_playwright_*.txt"`) do set "PW_BEFORE=%%I"
call "%SCRIPT_DIR%\env_utils.bat" load_env_vars "%APP3_DIR%" 3001 "http://localhost:3001" APP3_PORT APP3_BASE >nul
call "%SCRIPT_DIR%\env_utils.bat" is_port_in_use !APP3_PORT! APP3_PORT_BUSY >nul
if "!APP3_PORT_BUSY!"=="1" (
    set "SKIP_API_START=1"
    echo Port !APP3_PORT! already in use. Skipping DEMOAPP003 API start.
) else (
    set "SKIP_API_START="
)
call "%PW_SCRIPT%"
set "PW_EXIT=%ERRORLEVEL%"
set "SKIP_API_START="
set "PW_AFTER="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -File "%BATCH_DIR%\.ps\get-latest-log.ps1" -Directory "%RESULT_DIR%" -Filter "demoapp003_typescript_playwright_*.txt"`) do set "PW_AFTER=%%I"
call :report_result "Playwright TS" "%RESULT_DIR%" "%PW_BEFORE%" "%PW_AFTER%" "%PW_EXIT%"
if not "%PW_EXIT%"=="0" set "OVERALL_EXIT=1"

rem --- DEMOAPP004: Playwright Python stack --------------------------------------
echo.
echo === Running Python API and Playwright BDD tests ===
set "PY_BEFORE="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -File "%BATCH_DIR%\.ps\get-latest-log.ps1" -Directory "%RESULT_DIR%" -Filter "demoapp004_python_playwright_*.txt"`) do set "PY_BEFORE=%%I"
call "%SCRIPT_DIR%\env_utils.bat" load_env_vars "%APP4_DIR%" 3002 "http://localhost:3002" APP4_PORT APP4_BASE >nul
call "%SCRIPT_DIR%\env_utils.bat" is_port_in_use !APP4_PORT! APP4_PORT_BUSY >nul
if "!APP4_PORT_BUSY!"=="1" (
    set "SKIP_API_START=1"
    echo Port !APP4_PORT! already in use. Skipping DEMOAPP004 API start.
) else (
    set "SKIP_API_START="
)
call "%PY_SCRIPT%"
set "PY_EXIT=%ERRORLEVEL%"
set "SKIP_API_START="
set "PY_AFTER="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -File "%BATCH_DIR%\.ps\get-latest-log.ps1" -Directory "%RESULT_DIR%" -Filter "demoapp004_python_playwright_*.txt"`) do set "PY_AFTER=%%I"
call :report_result "Playwright PY" "%RESULT_DIR%" "%PY_BEFORE%" "%PY_AFTER%" "%PY_EXIT%"
if not "%PY_EXIT%"=="0" set "OVERALL_EXIT=1"

rem --- DEMOAPP002: .NET + Playwright stack --------------------------------------
echo.
echo === Running .NET API and Playwright tests ===
set "CS_BEFORE="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -File "%BATCH_DIR%\.ps\get-latest-log.ps1" -Directory "%RESULT_DIR%" -Filter "demoapp002_csharp_playwright_*.txt"`) do set "CS_BEFORE=%%I"
set "APP2_PORT=5228"
call "%SCRIPT_DIR%\env_utils.bat" is_port_in_use !APP2_PORT! APP2_PORT_BUSY >nul
if "!APP2_PORT_BUSY!"=="1" (
    set "SKIP_API_START=1"
    echo Port !APP2_PORT! already in use. Skipping DEMOAPP002 API start.
) else (
    set "SKIP_API_START="
)
call "%CS_SCRIPT%"
set "CS_EXIT=%ERRORLEVEL%"
set "SKIP_API_START="
set "CS_AFTER="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -File "%BATCH_DIR%\.ps\get-latest-log.ps1" -Directory "%RESULT_DIR%" -Filter "demoapp002_csharp_playwright_*.txt"`) do set "CS_AFTER=%%I"
call :report_result ".NET Playwright" "%RESULT_DIR%" "%CS_BEFORE%" "%CS_AFTER%" "%CS_EXIT%"
if not "%CS_EXIT%"=="0" set "OVERALL_EXIT=1"

rem --- Final summary ------------------------------------------------------------
echo.
if "%OVERALL_EXIT%"=="0" (
    echo === Combined run completed successfully ===
) else (
    echo === Combined run completed with failures. Review logs above. ===
)

>> "%METRICS_RAW%" echo OverallExit=%OVERALL_EXIT%
powershell -NoProfile -File "%BATCH_DIR%\.ps\render-run-metrics.ps1" -MetricsFile "%METRICS_RAW%" -TextFile "%METRICS_FILE%" -MarkdownFile "%METRICS_MD%"
set "FINAL_EXIT=%OVERALL_EXIT%"
goto cleanup

:fail
set "FINAL_EXIT=1"
goto cleanup

:cleanup
if "%PUSHED_ROOT%"=="1" popd
popd
endlocal & exit /b %FINAL_EXIT%

:report_result
rem Helper: print a friendly summary for each runner, showing result files and
rem         exit codes so the combined script mirrors the single-run behaviour.
rem %1=label, %2=results directory, %3=before file, %4=after file, %5=exit code
set "LABEL=%~1"
set "DIR=%~2"
set "BEFORE=%~3"
set "AFTER=%~4"
set "EXIT_CODE=%~5"

if not defined AFTER (
    echo [%LABEL%] No result file detected in "%DIR%".
    set "LOG_PATH=unavailable"
    goto :report_status
)

if defined BEFORE (
    if /I "%AFTER%"=="%BEFORE%" (
        echo [%LABEL%] Result file unchanged: "%DIR%\%AFTER%"
    ) else (
        echo [%LABEL%] Result file: "%DIR%\%AFTER%"
    )
) else (
    echo [%LABEL%] Result file: "%DIR%\%AFTER%"
)
set "LOG_PATH=%DIR%\%AFTER%"

:report_status
if "%EXIT_CODE%"=="0" (
    echo [%LABEL%] Tests completed successfully.
) else (
    echo [%LABEL%] Tests failed with exit code %EXIT_CODE%.
)
if defined METRICS_RAW (
    >> "%METRICS_RAW%" echo %LABEL%_Exit=%EXIT_CODE%,%LABEL%_Log=%LOG_PATH%
)
exit /b
