@echo off
rem Finds a Node.js runtime and runs %* with it from the plugin root (the plugin passes
rem ./scripts/bootstrap.mjs).
rem Windows twin of scripts/launch - read that file for the reasoning. The host starts
rem "./scripts/launch"; on Windows that resolves to this .cmd, the way OpenAI's own bundled
rem plugin "codex-app-tools" pairs launch_codex_app_tools_mcp with a .cmd of the same name.
rem
rem NOT verified on a real Windows machine. Where each location comes from:
rem   [openai]   a variable OpenAI's bundled plugin forwards to its own launcher on every OS
rem   [inferred] the Windows form of a path verified on macOS, or the documented default of
rem              the named tool
rem
rem Written without parenthesised blocks around paths and without delayed expansion, so
rem that "Program Files (x86)", "&" and "!" in a path cannot change what is executed. This
rem file must keep CRLF line endings (see .gitattributes): cmd.exe mis-parses labels in
rem LF-only batch files.
setlocal EnableExtensions DisableDelayedExpansion

set "MIN_MAJOR=18"
set "FOUND="
set "TOO_OLD="

if "%~1"=="" goto :no_script

rem The script is named relative to the plugin and Node resolves it against the working
rem directory, so that is always the plugin root, taken from this file's own location: a
rem host that starts the launcher from the user's workspace must not make it run a
rem scripts\bootstrap.mjs found there. It also keeps "where node" below, which looks in the
rem working directory before PATH, away from a node.cmd an untrusted folder could hold.
cd /d "%~dp0.." 2>nul || goto :no_root

rem 1. the runtime the host app points at                                           [openai]
if defined CODEX_MCP_NODE_PATH call :try "%CODEX_MCP_NODE_PATH%"
if defined CODEX_BROWSER_USE_NODE_PATH call :try "%CODEX_BROWSER_USE_NODE_PATH%"
rem    Node for Windows unpacks with node.exe at the top level, the app's Unix layout has
rem    it under bin: both are tried                                               [inferred]
if defined CODEX_ELECTRON_RESOURCES_PATH call :try "%CODEX_ELECTRON_RESOURCES_PATH%\cua_node\node.exe"
if defined CODEX_ELECTRON_RESOURCES_PATH call :try "%CODEX_ELECTRON_RESOURCES_PATH%\cua_node\bin\node.exe"

rem 2. the runtime the app unpacks into the user's cache: ~/.cache/codex-runtimes on
rem    macOS (verified there); LOCALAPPDATA is tried because OpenAI's plugin forwards
rem    it to its launcher                                                         [inferred]
set "CACHE_ROOT="
if defined USERPROFILE set "CACHE_ROOT=%USERPROFILE%\.cache"
if defined XDG_CACHE_HOME set "CACHE_ROOT=%XDG_CACHE_HOME%"
if defined CACHE_ROOT call :try "%CACHE_ROOT%\codex-runtimes\codex-primary-runtime\dependencies\node\node.exe"
if defined CACHE_ROOT call :try "%CACHE_ROOT%\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if defined LOCALAPPDATA call :try "%LOCALAPPDATA%\codex-runtimes\codex-primary-runtime\dependencies\node\node.exe"
if defined LOCALAPPDATA call :try "%LOCALAPPDATA%\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

rem 3. a Node named explicitly, then whatever PATH has
if defined NODE call :try "%NODE%"
for /f "delims=" %%p in ('where node 2^>nul') do call :try "%%p"

rem 4. usual install locations that a desktop app's PATH can miss                 [inferred]
rem    the nodejs.org installer
if defined ProgramFiles call :try "%ProgramFiles%\nodejs\node.exe"
rem    nvm-windows keeps the active version behind this link
if defined NVM_SYMLINK call :try "%NVM_SYMLINK%\node.exe"
rem    Volta's shim directory
if defined LOCALAPPDATA call :try "%LOCALAPPDATA%\Volta\bin\node.exe"

if defined FOUND goto :run
if defined TOO_OLD goto :too_old
>&2 echo [ccxt-mcp plugin] could not start: no Node.js runtime was found - update or reinstall the ChatGPT / Codex app (it brings its own), or install Node.js %MIN_MAJOR% or newer from https://nodejs.org, then restart the app.
exit /b 127

:too_old
>&2 echo [ccxt-mcp plugin] could not start: the CCXT server needs Node.js %MIN_MAJOR% or newer, but the only one found is an older one - update the ChatGPT / Codex app, or install the current Node.js from https://nodejs.org, then restart the app.
exit /b 127

:no_root
>&2 echo [ccxt-mcp plugin] could not start: the plugin folder cannot be opened - reinstall the CCXT plugin.
exit /b 66

:no_script
>&2 echo [ccxt-mcp plugin] could not start: the launcher was given no script to run - reinstall the CCXT plugin.
exit /b 64

:run
"%FOUND%" %*
exit /b %ERRORLEVEL%

rem Remembers the candidate in FOUND when it is an existing Node of at least MIN_MAJOR.
rem The version comes from "node --version" (v24.1.0) and is compared as a number. The
rem escaped outer quotes keep the candidate path quoted for both parsers of the for /f line.
:try
if defined FOUND exit /b 0
set "CANDIDATE=%~1"
if not defined CANDIDATE exit /b 0
if not exist "%CANDIDATE%" exit /b 0
set "VERSION="
for /f "delims=" %%v in ('^""%CANDIDATE%" --version 2^>nul^"') do if not defined VERSION set "VERSION=%%v"
if not defined VERSION exit /b 0
set "MAJOR=%VERSION:~1%"
for /f "tokens=1 delims=." %%m in ("%MAJOR%") do set "MAJOR=%%m"
echo(%MAJOR%| findstr /r /x "[0-9][0-9]*" >nul || exit /b 0
if %MAJOR% LSS %MIN_MAJOR% set "TOO_OLD=1"
if %MAJOR% GEQ %MIN_MAJOR% set "FOUND=%CANDIDATE%"
exit /b 0
