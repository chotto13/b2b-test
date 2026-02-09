# Guide d'installation - Deux A Para

## Option 1: Docker (Recommandé)

### Étape 1: Démarrer PostgreSQL avec Docker

```powershell
docker run --name postgres-deuxapara `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=deuxapara `
  -p 5432:5432 `
  -d postgres:15
```

### Étape 2: Initialiser la base de données

```bash
cd deux-a-para
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

### Étape 3: Accéder à l'application

Ouvrez http://localhost:3000

**Identifiants de test:**
- Admin: `admin@deuxapara.ma` / `admin123`
- Client: `pharmacien@pharmaciecentrale.ma` / `user123`

---

## Option 2: PostgreSQL local

### Prérequis
- PostgreSQL 14+ installé
- Node.js 18+

### Étape 1: Créer la base de données

```sql
CREATE DATABASE deuxapara;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE deuxapara TO postgres;
```

### Étape 2: Configurer les variables d'environnement

Créez un fichier `.env` à la racine:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/deuxapara?schema=public"
NEXTAUTH_SECRET="votre-secret-min-32-caracteres"
```

### Étape 3: Installer et démarrer

```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

---

## Résolution de problèmes

### Erreur: "Can't reach database server"
- Vérifiez que PostgreSQL est démarré
- Vérifiez les credentials dans `.env`
- Vérifiez le port (5432 par défaut)

### Erreur: "Prisma Client not found"
```bash
npx prisma generate
```

### Erreur: "Table does not exist"
```bash
npx prisma db push
```

### Erreur: "No users found"
```bash
npx prisma db seed
```

---

## Commandes utiles

```bash
# Redémarrer avec Docker
docker stop postgres-deuxapara
docker start postgres-deuxapara

# Voir les logs
docker logs postgres-deuxapara

# Reset complet
docker rm -f postgres-deuxapara
docker run --name postgres-deuxapara -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=deuxapara -p 5432:5432 -d postgres:15
npx prisma db push
npx prisma db seed
```
