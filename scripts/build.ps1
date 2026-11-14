$NodePath = "$HOME\DevTools\node-v22.18.0-win-x64"

$env:PATH = "$NodePath;$env:PATH"

Write-Host "Using Node:" -ForegroundColor Cyan
node -v

npm run build