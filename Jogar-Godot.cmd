@echo off
setlocal
cd /d "%~dp0"
if exist ".tools\godot\Godot_v4.5.1-stable_win64.exe" (
  start "" ".tools\godot\Godot_v4.5.1-stable_win64.exe" --path "%~dp0."
  exit /b 0
)
where godot >nul 2>nul
if errorlevel 1 (
  echo Godot nao encontrado. Veja a instalacao no README.md.
  pause
  exit /b 1
)
godot --path "%~dp0."
