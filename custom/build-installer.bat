@echo off
setlocal
chcp 65001 >nul

set "REPO_ROOT=%~dp0.."
pushd "%REPO_ROOT%" || goto :wrong_directory

where node.exe >nul 2>nul || goto :missing_node
where corepack.cmd >nul 2>nul || goto :missing_corepack

echo [1/2] Installing locked dependencies...
call corepack pnpm install --frozen-lockfile
if errorlevel 1 goto :failed

echo [2/2] Building the Windows installer...
call corepack pnpm run desktop:dist:win
if errorlevel 1 goto :failed

set "INSTALLER="
for %%F in ("custom\desktop\dist\DeepSeek-Harness-Setup-*-x64.exe") do (
  if exist "%%~fF" set "INSTALLER=%%~fF"
)

if not defined INSTALLER goto :missing_installer

echo.
echo Build completed:
echo %INSTALLER%
start "" explorer.exe /select,"%INSTALLER%"
popd
pause
exit /b 0

:missing_node
echo Node.js is not installed or node.exe is not available on PATH.
goto :failed_without_directory

:missing_corepack
echo Corepack is not available. Install a supported Node.js release with Corepack.
goto :failed_without_directory

:wrong_directory
echo Cannot open the repository directory: %REPO_ROOT%
goto :failed_without_directory

:missing_installer
echo Build finished, but no installer was found under custom\desktop\dist.
goto :failed

:failed
popd

:failed_without_directory
echo.
echo Packaging failed. Review the messages above.
pause
exit /b 1
