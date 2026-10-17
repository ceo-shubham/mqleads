@echo off
echo ========================================================
echo Starting MQLeads Server and Cloudflare Tunnel...
echo Domain: https://mqleads.zenstro.space
echo ========================================================

start "MQLeads Next.js Server" /b node --env-file=.env.local node_modules\next\dist\bin\next start -p 3000
timeout /t 3 /nobreak >nul

start "Cloudflare Tunnel" /b "%~dp0cloudflared.exe" tunnel run --token eyJhIjoiM2M2MmZkN2IxMDFjYjQ1MjY2YmNjYTYyMzdjODBmNTgiLCJ0IjoiOTA4NzgzNmUtODI3Ni00OGU5LWI0ZDYtM2MzMmI1ZDU3OTYxIiwicyI6IkFpK2x1d0VFalBDeUxVVHA2ajM5OXd4UmdXc1phZCtRb3NrVWsraE5ORXRleUhKYkFab0VXd0NsNExrVEI5UHVSdUZIaHhBNEIzMmhmVkt3UTBsYmhnPT0ifQ==

echo MQLeads is live at https://mqleads.zenstro.space
