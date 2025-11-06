@echo off
setlocal

pushd "%~dp0.."
set "ROOT_DIR=%CD%"
set "SERVER_PORT=3000"
set "PORT=%SERVER_PORT%"

if not exist ".results" mkdir ".results"

for /f %%I in ('powershell -NoProfile -Command "(Get-Date).ToUniversalTime().ToString(\"yyyyMMddTHHmmZ\")"') do set "UTC_TIMESTAMP=%%I"
set "RESULT_FILE=%ROOT_DIR%\.results\demoapp001_typescript_cypress_%UTC_TIMESTAMP%.txt"

for /f %%I in ('powershell -NoProfile -Command "$p = Start-Process -FilePath 'npm' -ArgumentList 'run','start' -WorkingDirectory '%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP001_TYPESCRIPT_CYPRESS' -PassThru; $p.Id"') do set "API_PID=%%I"

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

echo Opening Swagger UI at http://localhost:%SERVER_PORT%/swagger/v1/json...
start "" "http://localhost:%SERVER_PORT%/swagger/v1/json"

pushd "_API_TESTING_GHERKIN_\DEMOAPP001_TYPESCRIPT_CYPRESS"
echo Running Cypress test suite...
call npx cypress run > "%RESULT_FILE%" 2>&1
set "TEST_EXIT=%ERRORLEVEL%"
popd

goto cleanup

:cleanup_fail
set "TEST_EXIT=1"

:cleanup
if defined API_PID (
    powershell -NoProfile -Command "try { Stop-Process -Id %API_PID% -Force -ErrorAction SilentlyContinue } catch {}" >nul 2>&1
)

if defined TEST_EXIT (
    if "%TEST_EXIT%"=="0" (
echo DEMOAPP001 TypeScript + Cypress tests completed successfully. Results saved to "%RESULT_FILE%"
        set "EXIT_CODE=0"
    ) else (
echo DEMOAPP001 TypeScript + Cypress tests failed. See "%RESULT_FILE%"
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
