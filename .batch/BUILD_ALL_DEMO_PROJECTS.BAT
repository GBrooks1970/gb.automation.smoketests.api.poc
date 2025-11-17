@echo off
setlocal EnableDelayedExpansion

pushd "%~dp0.."
set "ROOT_DIR=%CD%"
set "OVERALL_EXIT=0"

echo === Building DEMOAPP001 TypeScript + Cypress ===
call :build_ts "_API_TESTING_GHERKIN_\DEMOAPP001_TYPESCRIPT_CYPRESS"
if errorlevel 1 set "OVERALL_EXIT=1"
echo.

echo === Building DEMOAPP003 TypeScript + Playwright ===
call :build_ts "_API_TESTING_GHERKIN_\DEMOAPP003_TYPESCRIPT_PLAYWRIGHT"
if errorlevel 1 set "OVERALL_EXIT=1"
echo.

echo === Building DEMOAPP002 C# + SpecFlow/Playwright ===
call :build_dotnet "_API_TESTING_GHERKIN_\DEMOAPP002_CSHARP_PLAYWRIGHT\TokenParserAPI.sln"
if errorlevel 1 set "OVERALL_EXIT=1"
echo.

echo === Building DEMOAPP004 Python + Playwright ===
call :build_python "_API_TESTING_GHERKIN_\DEMOAPP004_PYTHON_PLAYWRIGHT"
if errorlevel 1 set "OVERALL_EXIT=1"
echo.

if "%OVERALL_EXIT%"=="0" (
    echo === All demo projects built successfully ===
) else (
    echo === One or more build steps failed. See logs above. ===
)

popd
endlocal & exit /b %OVERALL_EXIT%

:build_ts
rem %1 = project directory
set "PROJECT_DIR=%ROOT_DIR%\%~1"
if not exist "%PROJECT_DIR%\package.json" (
    echo [ERROR] package.json not found in "%PROJECT_DIR%"
    exit /b 1
)
pushd "%PROJECT_DIR%"
echo [npm] Installing dependencies in "%PROJECT_DIR%"
call npm install
if errorlevel 1 (
    echo [ERROR] npm install failed in "%PROJECT_DIR%"
    popd
    exit /b 1
)
if exist package-lock.json (
    if exist package.json (
        for /f %%C in ('powershell -NoProfile -Command "(Get-Content package.json | ConvertFrom-Json).scripts.'typecheck'"') do set "HAS_TYPECHECK=%%C"
    )
)
if exist package.json (
    for /f "usebackq tokens=1* delims=:" %%A in (`powershell -NoProfile -Command "(Get-Content package.json | ConvertFrom-Json).scripts | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name"`) do (
        if /I "%%A"=="ts:check" set "HAS_TSCHECK=1"
        if /I "%%A"=="typecheck" set "HAS_TYPECHECK=1"
    )
)
if defined HAS_TSCHECK (
    echo [npm] Running npm run ts:check in "%PROJECT_DIR%"
    call npm run ts:check
    if errorlevel 1 (
        echo [ERROR] npm run ts:check failed in "%PROJECT_DIR%"
        popd
        exit /b 1
    )
) else if defined HAS_TYPECHECK (
    echo [npm] Running npm run typecheck in "%PROJECT_DIR%"
    call npm run typecheck
    if errorlevel 1 (
        echo [ERROR] npm run typecheck failed in "%PROJECT_DIR%"
        popd
        exit /b 1
    )
) else (
    echo [WARN] No ts:check/typecheck script found in "%PROJECT_DIR%". Skipping TS verify.
)
popd
set "HAS_TSCHECK="
set "HAS_TYPECHECK="
exit /b 0

:build_dotnet
rem %1 = solution file relative to root
set "SOLUTION_PATH=%ROOT_DIR%\%~1"
if not exist "%SOLUTION_PATH%" (
    echo [ERROR] Solution "%SOLUTION_PATH%" not found.
    exit /b 1
)
echo [dotnet] Building "%SOLUTION_PATH%"
dotnet build "%SOLUTION_PATH%"
exit /b %ERRORLEVEL%

:build_python
rem %1 = project directory
set "PROJECT_DIR=%ROOT_DIR%\%~1"
if not exist "%PROJECT_DIR%\pyproject.toml" (
    echo [ERROR] pyproject.toml not found in "%PROJECT_DIR%".
    exit /b 1
)

pushd "%PROJECT_DIR%"
echo [python] Installing editable package (with dev extras) in "%PROJECT_DIR%"
python -m pip install -e .[dev]
if errorlevel 1 (
    echo [ERROR] pip install failed in "%PROJECT_DIR%"
    popd
    exit /b 1
)
popd
exit /b 0
