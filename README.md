# Deux A Para - Espace Pro

Portail B2B eCommerce complet pour professionnels de santé (pharmacies, parapharmacies, cliniques).

## ✨ Fonctionnalités

### Client
- 🔐 Authentification sécurisée (NextAuth.js)
- 📋 Catalogue produits avec filtres et recherche
- 🛒 Panier avec MOQ/pack sizes
- ⚡ Commande rapide (import par copier-coller)
- 📦 Suivi des commandes avec timeline
- 📄 Factures téléchargeables
- 🎫 Support tickets
- 👤 Gestion du compte

### Admin
- 📊 Dashboard avec statistiques
- 📝 Gestion produits (CRUD)
- 📁 Import/Export Excel
- 👥 Gestion clients (approbation)
- 📦 Gestion des commandes
- 📈 Rapports

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer la base de données
cp .env.example .env
# Éditer DATABASE_URL dans .env

# 3. Initialiser la base de données
npm run db:push
npm run db:seed

# 4. Lancer le serveur
npm run dev
```

### Identifiants de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | admin@deuxapara.ma | admin123 |
| Client Pro | pharmacien@pharmaciecentrale.ma | user123 |

## 📁 Structure

```
deux-a-para/
├── prisma/
│   └── schema.prisma       # Schéma de données complet
├── src/
│   ├── app/
│   │   ├── (auth)/         # Pages d'auth (login, register)
│   │   ├── (dashboard)/    # Pages protégées
│   │   │   ├── dashboard/  # Tableau de bord
│   │   │   ├── catalogue/  # Catalogue produits
│   │   │   ├── panier/     # Panier
│   │   │   ├── commandes/  # Liste + détail commandes
│   │   │   ├── factures/   # Factures
│   │   │   ├── support/    # Tickets support
│   │   │   ├── compte/     # Profil
│   │   │   └── admin/      # Panel admin
│   │   └── api/            # API Routes
│   ├── components/         # Composants UI
│   └── lib/               # Utils, DB, Auth
└── package.json
```

## 🗄️ Schéma de données

### Entités principales
- **Company** (Entreprise) - ICE, IF, RC, approbation
- **User** (Utilisateur) - rôles, authentification
- **Product** (Produit) - SKU, prix, stock, MOQ
- **Order** (Commande) - statuts, historique
- **Invoice** (Facture) - PDF, paiements
- **Ticket** (Support) - messages

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev                 # Serveur de développement
npm run build              # Build production

# Base de données
npm run db:push            # Synchroniser schéma
npm run db:migrate         # Créer migration
npm run db:studio          # Ouvrir Prisma Studio
npm run db:seed            # Données de test
npm run db:reset           # Reset complet

# Génération
npm run db:generate        # Générer Prisma Client
```

## 🔒 Sécurité

- Middleware de protection des routes
- Validation des rôles (Admin/Client)
- Hashage des mots de passe (bcrypt)
- Protection CSRF via NextAuth

## 📝 Notes

- Interface 100% française
- Format monétaire: DH (dirham marocain)
- TVA: 20% par défaut
- MOQ: Minimum Order Quantity respecté
