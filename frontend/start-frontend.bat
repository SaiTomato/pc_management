@echo off
echo Starting React development server...
echo.
cd /d %~dp0
set BROWSER=none
npm start
pause
