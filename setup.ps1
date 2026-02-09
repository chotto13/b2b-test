# Script d'installation automatique Deux A Para

Write-Host "🚀 Configuration de Deux A Para..." -ForegroundColor Green

# Vérifier si Docker est installé
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue

if ($dockerInstalled) {
    Write-Host "✅ Docker trouvé" -ForegroundColor Green
    
    # Vérifier si le conteneur existe déjà
    $containerExists = docker ps -a --filter "name=postgres-deuxapara" --format "{{.Names}}"
    
    if ($containerExists) {
        Write-Host "🔄 Conteneur PostgreSQL trouvé, démarrage..." -ForegroundColor Yellow
        docker start postgres-deuxapara
    } else {
        Write-Host "🐳 Création du conteneur PostgreSQL..." -ForegroundColor Cyan
        docker run --name postgres-deuxapara `
            -e POSTGRES_USER=postgres `
            -e POSTGRES_PASSWORD=postgres `
            -e POSTGRES_DB=deuxapara `
            -p 5432:5432 `
            -d postgres:15
        
        Write-Host "⏳ Attente du démarrage de PostgreSQL (5s)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
} else {
    Write-Host "⚠️ Docker non trouvé. Assurez-vous que PostgreSQL est installé et en cours d'exécution." -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour continuer quand même"
}

# Créer le fichier .env s'il n'existe pas
if (!(Test-Path ".env")) {
    Write-Host "📝 Création du fichier .env..." -ForegroundColor Cyan
    @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/deuxapara?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(-join ((48..57) + (97..122) | Get-Random -Count 32 | ForEach-Object { [char]$_ }))"
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Fichier .env créé" -ForegroundColor Green
}

# Installer les dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Cyan
npm install

# Générer le client Prisma
Write-Host "🔄 Génération du Prisma Client..." -ForegroundColor Cyan
npx prisma generate

# Créer les tables
Write-Host "🗄️ Création des tables..." -ForegroundColor Cyan
npx prisma db push --accept-data-loss

# Seed les données
Write-Host "🌱 Insertion des données de test..." -ForegroundColor Cyan
npx prisma db seed

Write-Host ""
Write-Host "✅ Installation terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Démarrage du serveur..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Accédez à: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "Identifiants de test:" -ForegroundColor Yellow
Write-Host "  Admin: admin@deuxapara.ma / admin123" -ForegroundColor White
Write-Host "  Client: pharmacien@pharmaciecentrale.ma / user123" -ForegroundColor White
Write-Host ""

npm run dev
