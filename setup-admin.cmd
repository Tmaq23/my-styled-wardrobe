@echo off
REM Setup Admin Password for My Styled Wardrobe
REM This script helps configure the admin dashboard password

echo ===================================================================
echo           MY STYLED WARDROBE - ADMIN SETUP
echo ===================================================================
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo Creating .env.local file...
    type nul > .env.local
)

REM Check if ADMIN_PASSWORD already exists
findstr /C:"ADMIN_PASSWORD" .env.local >nul 2>&1
if %errorlevel% equ 0 (
    echo ADMIN_PASSWORD already exists in .env.local
    echo.
    set /p update="Do you want to update it? (y/n): "
    if /i "%update%"=="y" (
        REM Create temp file without ADMIN_PASSWORD line
        findstr /V /C:"ADMIN_PASSWORD" .env.local > .env.local.tmp
        move /y .env.local.tmp .env.local >nul
        
        REM Add new ADMIN_PASSWORD
        echo. >> .env.local
        echo # Admin Dashboard Password >> .env.local
        echo ADMIN_PASSWORD=GodMode?2023 >> .env.local
        echo Password updated to: GodMode?2023
    ) else (
        echo Cancelled. Password not updated.
        exit /b 0
    )
) else (
    REM Add ADMIN_PASSWORD
    echo. >> .env.local
    echo # Admin Dashboard Password >> .env.local
    echo ADMIN_PASSWORD=GodMode?2023 >> .env.local
    echo Admin password set to: GodMode?2023
)

echo.
echo ===================================================================
echo Admin setup complete!
echo.
echo Next steps:
echo 1. Restart your dev server: npm run dev
echo 2. Access admin panel at: http://localhost:3000/admin
echo 3. Login with password: GodMode?2023
echo.
echo ===================================================================
pause










