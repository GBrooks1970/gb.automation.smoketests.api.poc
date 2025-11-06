@echo off
setlocal

pushd "%~dp0.."
set "ROOT_DIR=%CD%"
set "SERVER_PORT=3001"
set "PORT=%SERVER_PORT%"
set "API_BASE_URL=http://localhost:%SERVER_PORT%"

if not exist ".results" mkdir ".results"

for /f %%I in ('powershell -NoProfile -Command "(Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmZ')"') do set "UTC_TIMESTAMP=%%I"
set "RESULT_FILE=%ROOT_DIR%\.results\demoapp003_typescript_playwright_%UTC_TIMESTAMP%.txt"

set "PROJECT_DIR=%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP003_TYPESCRIPT_PLAYWRIGHT"

for /f %%I in ('powershell -NoProfile -Command "$p = Start-Process -FilePath 'npm' -ArgumentList 'run','start' -WorkingDirectory '%PROJECT_DIR%' -PassThru; $p.Id"') do set "API_PID=%%I"

if not defined API_PID (
    echo Failed to start Playwright API host.
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

pushd "%PROJECT_DIR%"
echo Running Playwright BDD suite...
call npx cucumber-js --config tooling/cucumber.cjs > "%RESULT_FILE%" 2>&1
set "TEST_EXIT=%ERRORLEVEL%"
for /f "usebackq delims=" %%S in (`node tooling/cucumber-summary.cjs ".results/playwright_cucumber_report.json" %TEST_EXIT%`) do (
    echo %%S>> "%RESULT_FILE%"
    echo %%S
)
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
        echo DEMOAPP003 TypeScript + Playwright tests completed successfully. Results saved to "%RESULT_FILE%"
        set "EXIT_CODE=0"
    ) else (
        echo DEMOAPP003 TypeScript + Playwright tests failed. See "%RESULT_FILE%"
        set "EXIT_CODE=%TEST_EXIT%"
    )
) else (
    echo Test execution did not run. See "%RESULT_FILE%" for details.
    set "EXIT_CODE=1"
)

popd
set "FINAL_EXIT=%EXIT_CODE%"
set "PORT="
set "API_BASE_URL="
set "SERVER_PORT="
endlocal & exit /b %FINAL_EXIT%
