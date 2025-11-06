@echo off
setlocal

pushd "%~dp0"
set "BATCH_DIR=%CD%"
set "PUSHED_ROOT=0"

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

pushd ".."
set "ROOT_DIR=%CD%"
set "RESULT_DIR=%ROOT_DIR%\.results"
set "PUSHED_ROOT=1"

if not exist "%RESULT_DIR%" (
    mkdir "%RESULT_DIR%" >nul 2>&1
)

set "TS_SCRIPT=%BATCH_DIR%\RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT"
set "CS_SCRIPT=%BATCH_DIR%\RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT"
set "PW_SCRIPT=%BATCH_DIR%\RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT"

set "OVERALL_EXIT=0"

echo === Running TypeScript API and Cypress tests ===
call :latest_result "%RESULT_DIR%" "demoapp001_typescript_cypress_*.txt" TS_BEFORE
call "%TS_SCRIPT%"
set "TS_EXIT=%ERRORLEVEL%"
call :latest_result "%RESULT_DIR%" "demoapp001_typescript_cypress_*.txt" TS_AFTER
call :report_result "Cypress" "%RESULT_DIR%" "%TS_BEFORE%" "%TS_AFTER%" "%TS_EXIT%"
if not "%TS_EXIT%"=="0" set "OVERALL_EXIT=1"

echo.
echo === Running TypeScript API and Playwright BDD tests ===
call :latest_result "%RESULT_DIR%" "demoapp003_typescript_playwright_*.txt" PW_BEFORE
call "%PW_SCRIPT%"
set "PW_EXIT=%ERRORLEVEL%"
call :latest_result "%RESULT_DIR%" "demoapp003_typescript_playwright_*.txt" PW_AFTER
call :report_result "Playwright TS" "%RESULT_DIR%" "%PW_BEFORE%" "%PW_AFTER%" "%PW_EXIT%"
if not "%PW_EXIT%"=="0" set "OVERALL_EXIT=1"

echo.
echo === Running .NET API and Playwright tests ===
call :latest_result "%RESULT_DIR%" "demoapp002_csharp_playwright_*.txt" CS_BEFORE
call "%CS_SCRIPT%"
set "CS_EXIT=%ERRORLEVEL%"
call :latest_result "%RESULT_DIR%" "demoapp002_csharp_playwright_*.txt" CS_AFTER
call :report_result ".NET Playwright" "%RESULT_DIR%" "%CS_BEFORE%" "%CS_AFTER%" "%CS_EXIT%"
if not "%CS_EXIT%"=="0" set "OVERALL_EXIT=1"

echo.
if "%OVERALL_EXIT%"=="0" (
    echo === Combined run completed successfully ===
) else (
    echo === Combined run completed with failures. Review logs above. ===
)

set "FINAL_EXIT=%OVERALL_EXIT%"
goto cleanup

:fail
set "FINAL_EXIT=1"
goto cleanup

:cleanup
if "%PUSHED_ROOT%"=="1" popd
popd
endlocal & exit /b %FINAL_EXIT%

:latest_result
rem %1=results directory, %2=filter, %3=output variable name
set "%~3="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "Get-ChildItem -Path '%~1' -Filter '%~2' | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | ForEach-Object { $_.Name }"`) do (
    set "%~3=%%~I"
    goto :EOF
)
goto :EOF

:report_result
rem %1=label, %2=results directory, %3=before file, %4=after file, %5=exit code
set "LABEL=%~1"
set "DIR=%~2"
set "BEFORE=%~3"
set "AFTER=%~4"
set "EXIT_CODE=%~5"

if not defined AFTER (
    echo [%LABEL%] No result file detected in "%DIR%".
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

:report_status
if "%EXIT_CODE%"=="0" (
    echo [%LABEL%] Tests completed successfully.
) else (
    echo [%LABEL%] Tests failed with exit code %EXIT_CODE%.
)
goto :EOF
