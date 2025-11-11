@echo off
setlocal EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"

pushd "%SCRIPT_DIR%.."
set "ROOT_DIR=%CD%"
set "PROJECT_DIR=%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP001_TYPESCRIPT_CYPRESS"
call "%SCRIPT_DIR%env_utils.bat" load_env_vars "%PROJECT_DIR%" 3000 "http://localhost:3000" SERVER_PORT API_BASE_URL
set "PORT=%SERVER_PORT%"

if not exist ".results" mkdir ".results"

for /f %%I in ('powershell -NoProfile -Command "(Get-Date).ToUniversalTime().ToString(\"yyyyMMddTHHmmZ\")"') do set "UTC_TIMESTAMP=%%I"
set "RESULT_FILE=%ROOT_DIR%\.results\demoapp001_typescript_cypress_%UTC_TIMESTAMP%.txt"
set "UTIL_RESULT_FILE=%ROOT_DIR%\.results\demoapp001_typescript_cypress_util_%UTC_TIMESTAMP%.txt"

echo Running Cypress util test suite...
pushd "%PROJECT_DIR%"
call npx cypress run --spec "cypress/integration/util-tests/**/*.feature" > "%UTIL_RESULT_FILE%" 2>&1
set "UTIL_EXIT=%ERRORLEVEL%"
popd

if not "%UTIL_EXIT%"=="0" (
    echo DEMOAPP001 util tests failed. See "%UTIL_RESULT_FILE%"
    set "TEST_EXIT=%UTIL_EXIT%"
    goto cleanup
)

call "%SCRIPT_DIR%env_utils.bat" is_port_in_use %SERVER_PORT% PORT_IN_USE
if "%SKIP_API_START%"=="1" (
    echo SKIP_API_START set. Skipping DEMOAPP001 API start.
) else if "%PORT_IN_USE%"=="1" (
    echo Port %SERVER_PORT% already in use. Assuming DEMOAPP001 API is running.
) else (
    for /f %%I in ('powershell -NoProfile -Command "$p = Start-Process -FilePath 'npm' -ArgumentList 'run','start' -WorkingDirectory '%PROJECT_DIR%' -PassThru; $p.Id"') do set "API_PID=%%I"

    if not defined API_PID (
        echo Failed to start API host.
        goto cleanup_fail
    )

    echo API started with PID %API_PID%. Waiting for port %SERVER_PORT%...

    powershell -NoProfile -Command "for($i=0;$i -lt 30;$i++){ if(Test-NetConnection -ComputerName 'localhost' -Port %SERVER_PORT% -InformationLevel Quiet){ exit 0 } Start-Sleep -Seconds 2 }; exit 1"
    if errorlevel 1 (
        echo API did not become ready before timeout.
        goto cleanup_fail
    )

    echo Opening Swagger UI at %API_BASE_URL%/swagger/v1/json...
    start "" "%API_BASE_URL%/swagger/v1/json"
)

pushd "%PROJECT_DIR%"
echo Running Cypress test suite...
call npx cypress run > "%RESULT_FILE%" 2>&1
set "TEST_EXIT=%ERRORLEVEL%"
popd

goto cleanup

:cleanup_fail
set "TEST_EXIT=1"

:cleanup
if "%SKIP_API_START%"=="1" (
    set "API_PID="
) else (
    if defined API_PID (
        powershell -NoProfile -Command "try { Stop-Process -Id %API_PID% -Force -ErrorAction SilentlyContinue } catch {}" >nul 2>&1
    )
)

if defined TEST_EXIT (
    if "%TEST_EXIT%"=="0" (
        echo(
        echo DEMOAPP001 TypeScript + Cypress tests completed successfully. Results: "%RESULT_FILE%" ^(API^) / "%UTIL_RESULT_FILE%" ^(util^)
        set "EXIT_CODE=0"
    ) else (
        echo(
        echo DEMOAPP001 TypeScript + Cypress tests failed. API log: "%RESULT_FILE%". Util log: "%UTIL_RESULT_FILE%"
        set "EXIT_CODE=%TEST_EXIT%"
    )
) else (
    echo Test execution did not run. See "%RESULT_FILE%" for details.
    set "EXIT_CODE=1"
)

popd
set "FINAL_EXIT=%EXIT_CODE%"
set "PORT="
set "SERVER_PORT="
endlocal & exit /b %FINAL_EXIT%
