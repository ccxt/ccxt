:: Note, you can either:
::  A) run this file
::    or
::  B) directly add the last line (with double backslashed absolute paths) in your Windows preferred Git's pre-push command

set current_dir=%~dp0
:: need to double backslash it before passing into arg of command
set current_dir=%current_dir:\=\\\\%
:: in case of exit-code is not 0, we should prevent the window from auto-closing immediately
"%ProgramFiles%\Git\git-bash.exe" -c "%current_dir%pre-push; exit_code=$?; if [ $exit_code -ne 0 ]; then read; fi;"