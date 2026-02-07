# Deux A Para - Espace Pro

Portail B2B eCommerce pour professionnels de santé (pharmacies, parapharmacies, cliniques).

## 🚀 Technologies

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Prisma ORM
- **Base de données**: PostgreSQL
- **Authentification**: NextAuth.js (JWT)
- **Import/Export**: XLSX (Excel/CSV)

## 📋 Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## ⚙️ Installation

### 1. Cloner et installer les dépendances

```bash
cd deux-a-para
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Modifiez le fichier `.env` avec vos configurations :

```env
DATABASE_URL="postgresql://username:password@localhost:5432/deuxapara?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-super-secret-min-32-caracteres"
```

### 3. Initialiser la base de données

```bash
# Générer les migrations
npm run db:migrate

# Ou utiliser db push (pour développement)
npm run db:push

# Seed des données de test
npm run db:seed
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Accédez à l'application sur http://localhost:3000

## 🔑 Identifiants de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | admin@deuxapara.ma | admin123 |
| Client Pro | pharmacien@pharmaciecentrale.ma | user123 |

## 📁 Structure du projet

```
deux-a-para/
├── prisma/
│   ├── schema.prisma      # Schéma de la base de données
│   └── seed.ts            # Données de test
├── src/
│   ├── app/
│   │   ├── (auth)/        # Routes d'authentification
│   │   │   ├── login/
│   │   │   └── ...
│   │   ├── (dashboard)/   # Routes protégées
│   │   │   ├── dashboard/
│   │   │   ├── catalogue/
│   │   │   ├── commandes/
│   │   │   ├── commande-rapide/
│   │   │   ├── admin/
│   │   │   │   └── import-export/
│   │   │   └── ...
│   │   └── api/           # API Routes
│   │       ├── auth/
│   │       ├── products/
│   │       └── admin/
│   │           └── import/
│   ├── components/
│   │   ├── ui/            # Composants UI réutilisables
│   │   ├── layout/        # Layout components
│   │   └── providers/     # Context providers
│   ├── lib/
│   │   ├── utils.ts       # Fonctions utilitaires
│   │   ├── db.ts          # Client Prisma
│   │   └── auth.ts        # Configuration NextAuth
│   └── types/
│       └── index.ts       # Types TypeScript
└── package.json
```

## 🎯 Fonctionnalités principales

### Pour les clients professionnels

- **Catalogue produits** avec recherche et filtres
- **Prix spécifiques par client** (tarifs personnalisés)
- **Commande rapide** (recherche + import par copier-coller)
- **Panier** avec gestion des quantités (respect MOQ)
- **Suivi des commandes** avec timeline de statuts
- **Téléchargement des factures** (PDF)
- **Support tickets**

### Pour les administrateurs

- **Gestion produits** (CRUD + upload images)
- **Import/Export Excel** avec:
  - Prévisualisation des changements
  - Validation des données
  - Rapport d'erreurs
  - Templates téléchargeables
- **Gestion des stocks**
- **Gestion des clients** (workflow d'approbation)
- **Gestion des commandes**
- **Rapports et statistiques**

## 📊 Import/Export Excel

### Templates disponibles

1. **Import complet produits** (`PRODUCT_FULL`)
   - SKU, nom, marque, catégorie, description
   - Unité, pack_size, MOQ
   - Prix de base, prix promo, dates promo
   - TVA, stock, statut actif

2. **Mise à jour stock** (`PRODUCT_STOCK`)
   - SKU, quantité en stock

3. **Mise à jour prix** (`PRODUCT_PRICE`)
   - SKU, prix de base, prix promo, dates

### Modes d'import

- **Upsert** (par défaut): Crée les nouveaux, met à jour les existants
- **Update only**: Met à jour uniquement les existants
- **Create only**: Crée uniquement les nouveaux

### Processus d'import

1. **Upload**: Déposez votre fichier CSV ou Excel
2. **Validation**: Système vérifie les données et affiche un aperçu
3. **Prévisualisation**: Voir les créations, mises à jour et erreurs
4. **Confirmation**: Appliquez les changements
5. **Rapport**: Téléchargez le rapport d'erreurs (si applicable)

## 🎨 Conventions de code

### Formatage

- **Devise**: MAD (DH) - format: `1 234,56 DH`
- **Dates**: Format français - `15 janvier 2024`
- **Nombres**: Séparateur de milliers: espace, décimales: virgule

### Langue

- Interface: **Français** (obligatoire)
- Arabe et Anglais: Optionnels (future)

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev              # Lancer le serveur de développement
npm run build            # Build de production
npm run start            # Lancer en production

# Base de données
npm run db:migrate       # Créer et appliquer les migrations
npm run db:push          # Synchroniser le schéma (dev)
npm run db:studio        # Ouvrir Prisma Studio
npm run db:seed          # Insérer les données de test
npm run db:reset         # Reset complet + seed

# Code quality
npm run lint             # Linter le code
```

## 🔒 Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `DATABASE_URL` | URL de connexion PostgreSQL | Oui |
| `NEXTAUTH_URL` | URL de l'application | Oui |
| `NEXTAUTH_SECRET` | Secret pour JWT | Oui |
| `SMTP_HOST` | Serveur SMTP | Non |
| `SMTP_PORT` | Port SMTP | Non |
| `SMTP_USER` | Utilisateur SMTP | Non |
| `SMTP_PASSWORD` | Mot de passe SMTP | Non |
| `UPLOAD_ENDPOINT` | Endpoint S3 | Non |
| `UPLOAD_BUCKET` | Bucket S3 | Non |

## 📝 License

Propriétaire - Deux A Para © 2024

## 👥 Support

Pour toute question ou assistance :
- Email: support@deuxapara.ma
- Ticket: Via le portail support
