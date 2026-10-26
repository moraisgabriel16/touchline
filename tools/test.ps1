param([string]$Godot = '')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $Godot) {
    $portableGodot = Join-Path $projectRoot '.tools/godot/Godot_v4.5.1-stable_win64_console.exe'
    if (Test-Path -LiteralPath $portableGodot) { $Godot = $portableGodot }
    else { $Godot = (Get-Command godot -ErrorAction Stop).Source }
}
& $Godot --headless --path $projectRoot --editor --quit
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
foreach ($test in @('tests/unit/test_manager.gd', 'tests/unit/test_rpg.gd', 'tests/integration/test_manager_ui.gd', 'tests/integration/test_environments.gd', 'tests/unit/test_iso.gd', 'tests/integration/test_apartment.gd')) {
    & $Godot --headless --path $projectRoot --script $test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
& $Godot --headless --path $projectRoot --quit-after 120
exit $LASTEXITCODE
