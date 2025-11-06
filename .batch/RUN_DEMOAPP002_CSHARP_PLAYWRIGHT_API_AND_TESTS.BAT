@echo off
setlocal

pushd "%~dp0.."
set "ROOT_DIR=%CD%"
set "API_DIR=%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP002_CSHARP_PLAYWRIGHT\TokenParserAPI"
set "TEST_DIR=%ROOT_DIR%\_API_TESTING_GHERKIN_\DEMOAPP002_CSHARP_PLAYWRIGHT\TokenParserTests"

if not exist ".results" mkdir ".results"

for /f %%I in ('powershell -NoProfile -Command "(Get-Date).ToUniversalTime().ToString(\"yyyyMMddTHHmmZ\")"') do set "UTC_TIMESTAMP=%%I"
set "RESULT_FILE=%ROOT_DIR%\.results\demoapp002_csharp_playwright_%UTC_TIMESTAMP%.txt"

for /f %%I in ('powershell -NoProfile -Command "$p = Start-Process -FilePath 'dotnet' -ArgumentList 'run','--no-build','--project','%API_DIR%','--urls','http://localhost:5228' -WorkingDirectory '%API_DIR%' -PassThru; $p.Id"') do set "API_PID=%%I"

if not defined API_PID (
    echo Failed to start C# API.
    goto cleanup_fail
)

echo API started with PID %API_PID%. Waiting for port 5228...

powershell -NoProfile -Command "for($i=0;$i -lt 30;$i++){ if(Test-NetConnection -ComputerName 'localhost' -Port 5228 -InformationLevel Quiet){ exit 0 } Start-Sleep -Seconds 2 }; exit 1"
if errorlevel 1 (
    echo API did not become ready before timeout.
    goto cleanup_fail
)

echo Opening Swagger UI at http://localhost:5228/swagger...
start "" "http://localhost:5228/swagger"

if exist "%TEST_DIR%\..\playwright.ps1" (
    echo Ensuring Playwright dependencies are installed...
    powershell -NoProfile -Command "Try { & '%TEST_DIR%\..\playwright.ps1' install > $null 2>&1 } Catch { Write-Error 'Playwright install failed. Run `playwright install` manually.'; exit 1 }"
    if errorlevel 1 (
        echo Playwright dependency installation failed.
        set "TEST_EXIT=1"
        goto cleanup
    )
) else if exist "%TEST_DIR%\..\bin\Debug\net8.0\playwright.ps1" (
    echo Ensuring Playwright dependencies are installed...
    powershell -NoProfile -Command "Try { & '%TEST_DIR%\..\bin\Debug\net8.0\playwright.ps1' install > $null 2>&1 } Catch { Write-Error 'Playwright install failed. Run `playwright install` manually.'; exit 1 }"
    if errorlevel 1 (
        echo Playwright dependency installation failed.
        set "TEST_EXIT=1"
        goto cleanup
    )
) else (
    echo Playwright installation script not found; skipping dependency check.
)

pushd "%TEST_DIR%"
echo Running SpecFlow Playwright tests...
call dotnet test --no-build > "%RESULT_FILE%" 2>&1
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
echo DEMOAPP002 C# + Playwright tests completed successfully. Results saved to "%RESULT_FILE%"
        set "EXIT_CODE=0"
    ) else (
echo DEMOAPP002 C# + Playwright tests failed. See "%RESULT_FILE%"
        set "EXIT_CODE=%TEST_EXIT%"
    )
) else (
    echo Test execution did not run. See "%RESULT_FILE%" for details.
    set "EXIT_CODE=1"
)

popd
set "FINAL_EXIT=%EXIT_CODE%"
endlocal & exit /b %FINAL_EXIT%
