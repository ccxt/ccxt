

set current_dir=%~dp0
:: need to double backslash it before passing into arg of command
set current_dir=%current_dir:\=\\\\%
:: we need to add "read" in the end to prevent the window from auto-closing immediately
"%ProgramFiles%\Git\git-bash.exe" -c "%current_dir%pre-push; read"