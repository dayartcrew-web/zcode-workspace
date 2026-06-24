$projectDir = $PSScriptRoot
$simProcess = $null

if (-not (Test-Path "$projectDir\node_modules")) {
  Write-Host "=== Installing dependencies ===" -ForegroundColor Yellow
  pnpm install
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

# Ensure the simulation sidecar deps are installed too (optional service).
$simDir = Join-Path $projectDir "mini-services"
if ((Test-Path $simDir) -and -not (Test-Path "$simDir\node_modules")) {
  Write-Host "=== Installing simulation sidecar deps ===" -ForegroundColor Yellow
  Push-Location $simDir
  pnpm install 2>$null | Out-Null
  Pop-Location
}

Write-Host "=== Cleaning old build ===" -ForegroundColor Yellow
$nextDir = Join-Path $projectDir ".next"
if (Test-Path $nextDir) {
  Remove-Item -Path $nextDir -Recurse -Force
  Write-Host "Removed .next/" -ForegroundColor Green
}

Write-Host "=== Building Next.js ===" -ForegroundColor Cyan
pnpm exec next build
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "=== Copying standalone output ===" -ForegroundColor Yellow
$serverFile = Get-ChildItem -Path "$projectDir\.next\standalone" -Filter "server.js" -Recurse | Where-Object { $_.Directory.Name -eq $projectDir.Split('\')[-1] } | Select-Object -First 1
$serverDir = $serverFile.Directory

$staticDest = Join-Path $serverDir ".next\static"
if (-not (Test-Path $staticDest)) { New-Item -ItemType Directory -Path $staticDest -Force | Out-Null }
Copy-Item -Path "$projectDir\.next\static\*" -Destination $staticDest -Recurse -Force

$publicDest = Join-Path $serverDir "public"
if (-not (Test-Path $publicDest)) { New-Item -ItemType Directory -Path $publicDest -Force | Out-Null }
Copy-Item -Path "$projectDir\public\*" -Destination $publicDest -Recurse -Force

# Make sure the simulation sidecar is stopped when this script exits
# (Ctrl+C, normal exit, or error), so we never leave it dangling.
function Stop-SimSidecar {
  if ($script:simProcess -and -not $script:simProcess.HasExited) {
    Write-Host "`n=== Stopping simulation sidecar ===" -ForegroundColor Yellow
    try { Stop-Process -Id $script:simProcess.Id -Force -ErrorAction SilentlyContinue } catch {}
  }
}
$null = Register-EngineEvent PowerShell.Exiting -Action { Stop-SimSidecar }

# Start the optional live-simulation websocket sidecar (port 4001).
# If bun/tsx aren't available, this is skipped gracefully — the app still runs.
if (Test-Path "$simDir\sim-server.ts") {
  Write-Host "=== Starting simulation sidecar (:4001) ===" -ForegroundColor Cyan
  try {
    $script:simProcess = Start-Process -FilePath "bun" -ArgumentList "run", "$simDir\sim-server.ts" -WindowStyle Hidden -PassThru -ErrorAction Stop
    Write-Host "Simulation sidecar started (PID $($script:simProcess.Id))" -ForegroundColor Green
  } catch {
    Write-Host "Skipping simulation sidecar (bun not found). The app still runs without it." -ForegroundColor DarkGray
  }
}

Write-Host "`n=== Starting production server ===" -ForegroundColor Cyan
$env:NODE_ENV = "production"
Set-Location -Path $serverDir
try {
  node server.js
} finally {
  Stop-SimSidecar
}

