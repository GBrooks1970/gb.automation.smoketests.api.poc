@echo off
setlocal EnableDelayedExpansion

rem -------------------------------------------------------------------
rem ArchiveResults.bat
rem Moves all files from .results to .results\.old and prunes archived
rem files older than the requested window (default: 7 days).
rem Usage: ArchiveResults.bat [days]
rem        days - optional number of days to keep (files older than this
rem               threshold will be deleted from .results\.old)
rem -------------------------------------------------------------------

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%\.."

set "RESULT_DIR=%CD%\.results"
set "ARCHIVE_DIR=%RESULT_DIR%\.old"
set "KEEP_DAYS=%~1"
if "%KEEP_DAYS%"=="" set "KEEP_DAYS=7"

if not exist "%RESULT_DIR%" (
    echo [INFO] Results directory "%RESULT_DIR%" does not exist.
    popd
    exit /b 0
)

if not exist "%ARCHIVE_DIR%" (
    mkdir "%ARCHIVE_DIR%" >nul 2>&1
)

for /f %%I in ('powershell -NoProfile -Command "(Get-Date).AddDays(-%KEEP_DAYS%).ToString(\"o\")"') do set "CUTOFF=%%I"

echo [INFO] Moving result files from "%RESULT_DIR%" to "%ARCHIVE_DIR%".
powershell -NoProfile -Command "$result = '%RESULT_DIR%'; $archive = '%ARCHIVE_DIR%'; Get-ChildItem -Path $result -File | ForEach-Object { $dest = Join-Path $archive $_.Name; if (Test-Path $dest) { $timestamp = Get-Date -Format yyyyMMddHHmmss; $dest = Join-Path $archive ('{0}_{1}' -f $timestamp, $_.Name); } Move-Item -LiteralPath $_.FullName -Destination $dest }"

echo [INFO] Removing archived results older than %KEEP_DAYS% day(s).
powershell -NoProfile -Command "$archive = '%ARCHIVE_DIR%'; $cutoff = [datetime]'%CUTOFF%'; Get-ChildItem -Path $archive -File | Where-Object { $_.LastWriteTime -lt $cutoff } | ForEach-Object { Remove-Item -LiteralPath $_.FullName }"

popd
endlocal
