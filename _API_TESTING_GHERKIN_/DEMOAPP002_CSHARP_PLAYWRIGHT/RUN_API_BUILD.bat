@echo off
setlocal

pushd "%~dp0"
set "API_PROJECT=TokenParserAPI\TokenParserAPI.csproj"

if not exist "%API_PROJECT%" (
    echo API project file not found: %API_PROJECT%
    popd
    endlocal & exit /b 1
)

call dotnet build "%API_PROJECT%"
if errorlevel 1 (
    echo Build failed.
    popd
    endlocal & exit /b 1
)

echo Build succeeded. Starting API...
call dotnet run --no-build --project "%API_PROJECT%"
set "EXIT_CODE=%ERRORLEVEL%"

popd
endlocal & exit /b %EXIT_CODE%
