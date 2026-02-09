# Installation locale de PostgreSQL pour Deux A Para

Write-Host "🚀 Installation de PostgreSQL..." -ForegroundColor Green

# Vérifier si winget est disponible
$winget = Get-Command winget -ErrorAction SilentlyContinue

if ($winget) {
    Write-Host "📦 Installation via winget..." -ForegroundColor Cyan
    winget install -e --id PostgreSQL.PostgreSQL
    
    Write-Host ""
    Write-Host "⚠️ IMPORTANT: Redémarrez votre ordinateur après l'installation" -ForegroundColor Yellow
    Write-Host "Puis relancez ce script: .\setup.ps1" -ForegroundColor Yellow
} else {
    Write-Host "Téléchargez PostgreSQL ici:" -ForegroundColor Cyan
    Write-Host "https://www.enterprisedb.com/downloads/postgres-postgresql-downloads" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Instructions:" -ForegroundColor Yellow
    Write-Host "1. Téléchargez la version 15.x pour Windows" -ForegroundColor White
    Write-Host "2. Installez avec les paramètres par défaut" -ForegroundColor White
    Write-Host "3. Définissez le mot de passe: postgres" -ForegroundColor White
    Write-Host "4. Gardez le port par défaut: 5432" -ForegroundColor White
    Write-Host "5. Redémarrez votre ordinateur" -ForegroundColor White
    Write-Host "6. Relancez: .\setup.ps1" -ForegroundColor White
}
