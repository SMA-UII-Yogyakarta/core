#!/bin/sh
"C:\laragon\bin\php\php-8.4.23-Win32-vs17-x64\php.exe" artisan serve --port=8000 --host=127.0.0.1 &
sleep 4
echo "Testing server..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}" http://127.0.0.1:8000/login 2>&1
echo ""
echo "Server test complete"
