@echo off
echo Creating desktop shortcut for Ryann Apply...

set SHORTCUT_PATH=%USERPROFILE%\Desktop\Ryann Apply.lnk
set PROJECT_PATH=%~dp0..

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); $s.TargetPath = 'cmd.exe'; $s.Arguments = '/c cd /d %PROJECT_PATH% && npm run dev && start http://localhost:3000'; $s.WorkingDirectory = '%PROJECT_PATH%'; $s.Description = 'Ryann Apply - Job Application Automation'; $s.Save()"

echo.
echo Shortcut created on Desktop: "Ryann Apply"
echo Double-click to launch.
pause
