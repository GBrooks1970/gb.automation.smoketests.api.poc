@echo off
setlocal

pushd "%~dp0.."
set "ROOT_DIR=%CD%"

if not exist ".results" mkdir ".results"

for /f %%I in ('powershell -NoProfile -Command "(Get-Date).ToUniversalTime().ToString(\"yyyyMMddTHHmmZ\")"') do set "UTC_TIMESTAMP=%%I"
set "RESULT_FILE=%ROOT_DIR%\.results\cy_results_%UTC_TIMESTAMP%.txt"

for /f %%I in ('powershell -NoProfile -Command "$p = Start-Process -FilePath 'npm' -ArgumentList 'run','start' -WorkingDirectory '%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP001_TYPESCRIPT_CYPRESS' -PassThru; $p.Id"') do set "API_PID=%%I"

if not defined API_PID (
    echo Failed to start API host.
    goto cleanup_fail
)

echo API started with PID %API_PID%. Waiting for port 3000...

powershell -NoProfile -Command "for($i=0;$i -lt 30;$i++){ if(Test-NetConnection -ComputerName 'localhost' -Port 3000 -InformationLevel Quiet){ exit 0 } Start-Sleep -Seconds 2 }; exit 1"
if errorlevel 1 (
    echo API did not become ready before timeout.
    goto cleanup_fail
)

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
        echo Cypress tests completed successfully. Results saved to "%RESULT_FILE%"
        set "EXIT_CODE=0"
    ) else (
        echo Cypress tests failed. See "%RESULT_FILE%"
        set "EXIT_CODE=%TEST_EXIT%"
    )
) else (
    echo Test execution did not run. See "%RESULT_FILE%" for details.
    set "EXIT_CODE=1"
)

popd
set "FINAL_EXIT=%EXIT_CODE%"
endlocal & exit /b %FINAL_EXIT%
