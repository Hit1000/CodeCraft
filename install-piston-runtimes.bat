@echo off
echo ========================================
echo  Installing Piston Runtimes
echo ========================================
echo.

echo [1/8] Installing Python 3.12.0...
curl -s -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d "{\"language\":\"python\",\"version\":\"3.12.0\"}"
echo.

echo [2/8] Installing Node.js 20.11.1 (JavaScript)...
curl -s -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d "{\"language\":\"node\",\"version\":\"20.11.1\"}"
echo.

echo [3/8] Installing TypeScript 5.0.3...
curl -s -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d "{\"language\":\"typescript\",\"version\":\"5.0.3\"}"
echo.

echo [4/8] Installing Java 15.0.2...
curl -s -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d "{\"language\":\"java\",\"version\":\"15.0.2\"}"
echo.

echo [5/8] Installing Rust 1.68.2...
curl -s -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d "{\"language\":\"rust\",\"version\":\"1.68.2\"}"
echo.

echo [6/8] Installing GCC 10.2.0 (C/C++)...
curl -s -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d "{\"language\":\"gcc\",\"version\":\"10.2.0\"}"
echo.

echo [7/8] Installing Ruby 3.0.1...
curl -s -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d "{\"language\":\"ruby\",\"version\":\"3.0.1\"}"
echo.

echo [8/8] Installing Swift 5.3.3...
curl -s -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d "{\"language\":\"swift\",\"version\":\"5.3.3\"}"
echo.

echo.
echo ========================================
echo  All runtimes installed!
echo  Verifying installed packages...
echo ========================================
curl -s http://localhost:2000/api/v2/runtimes
echo.
