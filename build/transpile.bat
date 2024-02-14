@echo off
setlocal EnableDelayedExpansion

set /a ws=0
for /f "tokens=*" %%a in ("%*") do (
  if /i "%%a" == "--ws" (
    set /a ws=1
    goto :break
  )
)

:break

set exchange_name=%1

if !exchange_name! == "" (
  echo Exchange name not provided.
  exit /b 1
)

cd %~dp0/../

if %ws% == 1 (
  echo Transpiling WS version of %exchange_name% 
  node .\build\transpileWs.js %exchange_name% --ws
  node --loader ts-node/esm .\build\csharpTranspiler.ts %exchange_name% --ws
) else (
  echo Transpiling REST version of %exchange_name%
  node .\build\transpile.js %exchange_name%
  node --loader ts-node/esm .\build\csharpTranspiler.ts %exchange_name%
)

dotnet build cs\ccxt\ccxt.csproj

endlocal