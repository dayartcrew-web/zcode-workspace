$projectDir = $PSScriptRoot

if (-not (Test-Path "$projectDir\node_modules")) {
    Write-Host "=== Installing dependencies ===" -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) { exit 1 }
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

Write-Host "`n=== Starting production server ===" -ForegroundColor Cyan
$env:NODE_ENV = "production"
Set-Location -Path $serverDir
node server.js
