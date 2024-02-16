@echo off

set exchange_name=%1
set is_ws=%2

if "%exchange_name%" == "" (
  echo "Exchange name not provided"
  exit /b 1
) 

cd %~dp0/../

if "%is_ws%" == "--ws" (
  echo Transpiling WS version of %exchange_name% 
  node .\build\transpileWs.js %exchange_name% --ws
  node --loader ts-node/esm .\build\csharpTranspiler.ts %exchange_name% --ws
) else (
  echo Transpiling REST version of %exchange_name%
  node .\build\transpile.js %exchange_name%
  node --loader ts-node/esm .\build\csharpTranspiler.ts %exchange_name%
)

dotnet build cs\ccxt\ccxt.csproj
