@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM Usage: double-click to start Next.js standalone server on Windows
REM Requires Node.js installed on the server (Node 20+)

IF NOT DEFINED PORT SET PORT=3000
ECHO Starting My Styled Wardrobe on port %PORT% ...

node .\.next\standalone\server.js
