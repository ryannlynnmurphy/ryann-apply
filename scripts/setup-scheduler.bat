@echo off
echo Setting up job scraping schedule (every 8 hours)...

set SCRIPT_PATH=%~dp0scrape-cron.ts
set PROJECT_PATH=%~dp0..

schtasks /create /tn "RyannApply-JobScraper" /tr "cmd /c cd /d %PROJECT_PATH% && npx tsx scripts/scrape-cron.ts" /sc HOURLY /mo 8 /f

echo.
echo Task scheduled: RyannApply-JobScraper
echo Runs every 8 hours.
echo To remove: schtasks /delete /tn "RyannApply-JobScraper" /f
pause
