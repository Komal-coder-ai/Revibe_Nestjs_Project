@echo off
echo Creating admin user...
curl -X POST http://localhost:3000/api/admin/create -H "Content-Type: application/json" -d "{\"email\":\"Komalp@mailinator.com\",\"password\":\"Komal@123\",\"name\":\"Komal P\"}"
echo.
echo.
echo Done! Now you can login with:
echo Email: Komalp@mailinator.com
echo Password: Komal@123
pause
