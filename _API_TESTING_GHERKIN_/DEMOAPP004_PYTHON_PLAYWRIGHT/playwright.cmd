@echo off
REM Wrapper to ensure the Python Playwright CLI is used (avoids .NET CLI error).
python -m playwright %*
