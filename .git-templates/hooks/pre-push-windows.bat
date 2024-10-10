
set current_dir=%~dp0
cd %current_dir%/../../
call "%ProgramFiles%\Git\git-bash.exe" "%current_dir%pre-push" "--sleep"