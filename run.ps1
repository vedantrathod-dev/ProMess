$nodePath = "$env:LOCALAPPDATA\Programs\nodejs"
if ($env:Path -notlike "*$nodePath*") {
    $env:Path = "$nodePath;$env:Path"
}
Write-Host "Starting ProMess Development Server on http://localhost:3000..." -ForegroundColor Green
npm run dev
