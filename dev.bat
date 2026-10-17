@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
echo Starting ProMess on http://localhost:3000 ...
call npm run dev
