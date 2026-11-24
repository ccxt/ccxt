@echo off
rem Finds a Node.js runtime and runs its arguments with it from the plugin root (the plugin passes
rem ./scripts/bootstrap.mjs).
rem Windows twin of scripts/launch - read that file for the reasoning. The host starts
rem "./scripts/launch"; on Windows that has to resolve to this .cmd, the way OpenAI's own
rem bundled plugin "codex-app-tools" pairs launch_codex_app_tools_mcp with a .cmd of the
rem same name (the plugin README says what is and is not known about that step).
rem
rem test/integration/launcher.test.ts runs this file on Windows in CI. What no test can
rem show is where the ChatGPT / Codex app keeps its Node on Windows; where each location
rem comes from:
rem   [openai]   a variable OpenAI's bundled plugin forwards to its own launcher on every OS
rem   [inferred] the Windows form of a path verified on macOS, or the documented default of
rem              the named tool
rem
rem How this file stays safe with any path (spaces, parentheses, ampersands, carets,
rem percent and exclamation marks):
rem   - delayed expansion is off, and no path is expanded inside a parenthesised block
rem   - a path never travels as an argument of "call", which parses its line a second
rem     time: it is put into CANDIDATE or BASE and the subroutine reads the variable
rem   - a variable from the environment is copied with its double quotes removed, as the
rem     only expansion on its line and only when it is defined; what cmd makes of such an
rem     expansion of an undefined variable depends on the rest of the line
rem   - nothing a candidate prints is ever read: it is asked for its version through its
rem     exit status
rem   - no helper program is needed (the one use of where.exe is optional)
rem stdout is the MCP channel: nothing here writes to it, and no probe may read stdin.
rem This file must keep CRLF line endings (see .gitattributes): cmd.exe mis-parses labels
rem in LF-only batch files.
setlocal EnableExtensions DisableDelayedExpansion

set "MIN_MAJOR=18"
set "FOUND="
set "TOO_OLD="
set "CANDIDATE="
set "BASE="
set "CLI="

if "%~1"=="" goto :no_script

rem The script is named relative to the plugin and Node resolves it against the working
rem directory, so that is always the plugin root, taken from this file's own location: a
rem host that starts the launcher from the user's workspace must not make it run a
rem scripts\bootstrap.mjs found there. cmd also looks in the working directory before PATH
rem when it starts a program by name (where.exe below), which is one more reason to leave
rem an untrusted folder before anything is started.
cd /d "%~dp0.." 2>nul || goto :no_root

rem 1. the runtime the host app points at                                           [openai]
if defined CODEX_MCP_NODE_PATH set "CANDIDATE=%CODEX_MCP_NODE_PATH:"=%"
call :try
if defined CODEX_BROWSER_USE_NODE_PATH set "CANDIDATE=%CODEX_BROWSER_USE_NODE_PATH:"=%"
call :try
rem    Node for Windows unpacks with node.exe at the top level, the app's Unix layout has
rem    it under bin: both are tried, here and below                               [inferred]
if defined CODEX_ELECTRON_RESOURCES_PATH set "BASE=%CODEX_ELECTRON_RESOURCES_PATH:"=%"
call :try_under cua_node
rem    beside the app's CLI, and in the app's resources two levels above it, which is
rem    where the macOS app keeps the two (codex-cli\bin and cua_node)             [inferred]
rem    (only from an absolute path: a relative one would be read against the plugin folder)
if defined CODEX_CLI_PATH set "CLI=%CODEX_CLI_PATH:"=%"
if not defined CLI goto :after_cli
if not "%CLI:~1,2%"==":\" if not "%CLI:~1,2%"==":/" if not "%CLI:~0,2%"=="\\" goto :after_cli
for %%c in ("%CLI%\..") do set "BASE=%%~fc"
call :try_under cua_node
for %%c in ("%CLI%\..\..\..") do set "BASE=%%~fc"
call :try_under cua_node
:after_cli

rem 2. the runtime the app unpacks into the user's cache: ~/.cache/codex-runtimes on
rem    macOS (verified there); LOCALAPPDATA is tried because OpenAI's plugin forwards
rem    it to its launcher                                                         [inferred]
if defined USERPROFILE set "BASE=%USERPROFILE:"=%\.cache"
if defined XDG_CACHE_HOME set "BASE=%XDG_CACHE_HOME:"=%"
call :try_under codex-runtimes\codex-primary-runtime\dependencies\node
if defined LOCALAPPDATA set "BASE=%LOCALAPPDATA:"=%"
call :try_under codex-runtimes\codex-primary-runtime\dependencies\node

rem 3. a Node named explicitly, then whatever PATH has: the first node.exe on it, then
rem    every other one where.exe lists (the first may be too old)
if defined NODE set "CANDIDATE=%NODE:"=%"
call :try
for %%p in (node.exe) do set "CANDIDATE=%%~$PATH:p"
call :try
if not defined FOUND for /f "delims=" %%p in ('where node.exe 2^>nul ^<nul') do (set "CANDIDATE=%%p" & call :try)

rem 4. usual install locations that a desktop app's PATH can miss                 [inferred]
rem    the nodejs.org installer (ProgramW6432 is the 64-bit folder when this runs as a
rem    32-bit process)
if defined ProgramFiles set "CANDIDATE=%ProgramFiles:"=%\nodejs\node.exe"
call :try
if defined ProgramW6432 set "CANDIDATE=%ProgramW6432:"=%\nodejs\node.exe"
call :try
rem    nvm-windows keeps the active version behind this link
if defined NVM_SYMLINK set "CANDIDATE=%NVM_SYMLINK:"=%\node.exe"
call :try
rem    Volta's shim directory
if defined LOCALAPPDATA set "CANDIDATE=%LOCALAPPDATA:"=%\Volta\bin\node.exe"
call :try

if defined FOUND goto :run
if defined TOO_OLD goto :too_old
>&2 echo [ccxt-mcp plugin] could not start: no Node.js runtime was found - update or reinstall the ChatGPT / Codex app (it brings its own), or install Node.js %MIN_MAJOR% or newer from https://nodejs.org, then restart the app.
exit /b 127

:too_old
>&2 echo [ccxt-mcp plugin] could not start: the CCXT server needs Node.js %MIN_MAJOR% or newer, but the only one found is older ("%TOO_OLD%") - update the ChatGPT / Codex app, or install the current Node.js from https://nodejs.org, then restart the app.
exit /b 127

:no_root
>&2 echo [ccxt-mcp plugin] could not start: the plugin folder cannot be opened - reinstall the CCXT plugin.
exit /b 66

:no_script
>&2 echo [ccxt-mcp plugin] could not start: the launcher was given no script to run - reinstall the CCXT plugin.
exit /b 64

rem The arguments are the caller's own text, handed on as it came. A wrapper script (see :try)
rem takes over from here and its exit status is the launcher's; node.exe returns and reports
rem its own.
:run
"%FOUND%" %*
exit /b %ERRORLEVEL%

rem Tries node.exe and bin\node.exe in the folder its argument names under BASE. The argument
rem is always a literal from this file, never a value from the environment.
:try_under
set "UNDER=%BASE%"
set "BASE="
if not defined UNDER exit /b 0
set "CANDIDATE=%UNDER%\%~1\node.exe"
call :try
set "CANDIDATE=%UNDER%\%~1\bin\node.exe"
call :try
exit /b 0

rem Remembers CANDIDATE in FOUND when it is a Node of at least MIN_MAJOR, in TOO_OLD when
rem it is an older one. Takes the path in the variable, which it clears: see the rules at
rem the top.
rem A candidate is an absolute path of an existing node.exe, or of a .cmd / .bat wrapper
rem someone named explicitly. Anything else is not started at all: cmd hands a file that
rem is not a program to whatever application is registered for it.
rem The candidate says what it is through its exit status: 42 for a Node that is new
rem enough, 43 for an older one. Any other status, or none, is not a Node.
:try
set "PROBE=%CANDIDATE%"
set "CANDIDATE="
if defined FOUND exit /b 0
if not defined PROBE exit /b 0
if not "%PROBE:~1,2%"==":\" if not "%PROBE:~1,2%"==":/" if not "%PROBE:~0,2%"=="\\" exit /b 0
if not exist "%PROBE%" exit /b 0
if /i "%PROBE:~-4%"==".exe" goto :probe_program
if /i "%PROBE:~-4%"==".cmd" goto :probe_wrapper
if /i "%PROBE:~-4%"==".bat" goto :probe_wrapper
exit /b 0
:probe_program
"%PROBE%" -e "process.exit(Number(process.versions.node.split('.')[0])>=%MIN_MAJOR%?42:43)" <nul >nul 2>nul
goto :judge
:probe_wrapper
rem without "call" a batch file never returns here
call "%PROBE%" -e "process.exit(Number(process.versions.node.split('.')[0])>=%MIN_MAJOR%?42:43)" <nul >nul 2>nul
:judge
if errorlevel 44 exit /b 0
if errorlevel 43 goto :older
if errorlevel 42 set "FOUND=%PROBE%"
exit /b 0
:older
set "TOO_OLD=%PROBE%"
exit /b 0
