#!/bin/sh
nohup "C:\laragon\bin\php\php-8.4.23-Win32-vs17-x64\php.exe" artisan serve --port=8000 --host=127.0.0.1 > /dev/null 2>&1 &
echo "Server starting..."
