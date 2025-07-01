@echo off
set /p DATEGENERATED=<generate-date.txt
git add .
git commit -m "New modification, on day %DATEGENERATED%"
git push -f origin master
