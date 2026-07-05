#!/bin/sh
echo "Starting server..."
"C:\laragon\bin\php\php-8.4.23-Win32-vs17-x64\php.exe" artisan serve --port=8000 --host=127.0.0.1 &
SERVER_PID=$!
sleep 6
echo "Testing login page..."
HTTP_CODE=$(curl -s -o NUL -w "%{http_code}" http://127.0.0.1:8000/login 2>&1)
echo "HTTP status: $HTTP_CODE"
echo "Testing admin dashboard..."
HTTP_CODE2=$(curl -s -o NUL -w "%{http_code}" http://127.0.0.1:8000/admin/dashboard 2>&1)
echo "HTTP status: $HTTP_CODE2"
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null
echo "Done"
