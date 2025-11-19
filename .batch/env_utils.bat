@echo off
set "FN=%~1"
if "%FN%"=="" goto :EOF
shift
goto %FN%

:load_env_vars
rem %1 = project dir, %2 = default port, %3 = default base url, %4 = port var name, %5 = base var name (optional), %6 = optional global env template
set "ENV_PROJECT_DIR=%~1"
set "ENV_DEFAULT_PORT=%~2"
set "ENV_DEFAULT_BASE=%~3"
set "ENV_PORT_VAR=%~4"
set "ENV_BASE_VAR=%~5"
set "GLOBAL_ENV_FILE=%~6"

set "%ENV_PORT_VAR%="
if not "%ENV_BASE_VAR%"=="" set "%ENV_BASE_VAR%="

if defined GLOBAL_ENV_FILE (
  call :load_env_file "%GLOBAL_ENV_FILE%"
)

set "ENV_FILE=%ENV_PROJECT_DIR%\.env"
if not exist "%ENV_FILE%" set "ENV_FILE=%ENV_PROJECT_DIR%\.env.example"

if exist "%ENV_FILE%" (
  call :load_env_file "%ENV_FILE%"
)

if not defined %ENV_PORT_VAR% set "%ENV_PORT_VAR%=%ENV_DEFAULT_PORT%"
if not "%ENV_BASE_VAR%"=="" (
  if not defined %ENV_BASE_VAR% (
    if "%ENV_DEFAULT_BASE%"=="" (
      set "%ENV_BASE_VAR%=http://localhost:%ENV_DEFAULT_PORT%"
    ) else (
      set "%ENV_BASE_VAR%=%ENV_DEFAULT_BASE%"
    )
  )
)
exit /b 0

:load_env_file
set "SOURCE_FILE=%~1"
if not exist "%SOURCE_FILE%" exit /b 0
for /f "usebackq tokens=1* delims==" %%A in (`
  powershell -NoProfile -Command "Get-Content -LiteralPath '%SOURCE_FILE%' | Where-Object { $_ -and $_ -notmatch '^\s*#' } | ForEach-Object { $_.Trim() }"
`) do (
  if not "%%A"=="" (
    call set "%%A=%%B"
  )
)
exit /b 0

:is_port_in_use
rem %1 = port, %2 = output var (1 busy, 0 free)
set "PORT_STATE=FREE"
for /f "usebackq" %%I in (`
  powershell -NoProfile -Command "if (Test-NetConnection -ComputerName 'localhost' -Port %~1 -InformationLevel Quiet) { 'BUSY' } else { 'FREE' }"
`) do set "PORT_STATE=%%I"
if /I "%PORT_STATE%"=="BUSY" (
  set "%~2=1"
) else (
  set "%~2=0"
)
exit /b 0
