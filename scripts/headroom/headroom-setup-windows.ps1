# Headroom: always-on for Claude Code on this Windows machine (every project).
# Run in PowerShell (not as admin):  powershell -ExecutionPolicy Bypass -File .\headroom-setup-windows.ps1
$ErrorActionPreference = "Stop"

Write-Host "1/5  uv (Python tool installer)"
if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
    $env:Path = "$env:USERPROFILE\.local\bin;$env:Path"
}

Write-Host "2/5  Headroom"
uv tool install --python 3.13 "headroom-ai[all]" --force
$env:Path = "$env:USERPROFILE\.local\bin;$env:Path"
headroom --version

Write-Host "3/5  Usage beacon off"
setx HEADROOM_BEACON off | Out-Null
$env:HEADROOM_BEACON = "off"

Write-Host "4/5  Claude Code: route every session through Headroom (user scope)"
# Adds ANTHROPIC_BASE_URL + auto-start hooks to ~/.claude/settings.json and the headroom MCP tool.
headroom init -g claude

Write-Host "5/5  Check"
headroom doctor
Write-Host ""
Write-Host "Done. Close and reopen Claude Code (CLI or VS Code). Undo any time: headroom unwrap claude"
