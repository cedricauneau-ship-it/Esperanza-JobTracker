# Esperanza — Job Tracker

> 🚧 **Projet en cours de développement** — backend terminé, dashboard web et app mobile à venir.

Application fullstack de suivi de recherche d'emploi — scraping automatique des offres, gestion des candidatures et rappels de relance.

Construite en autonomie avec Node.js / TypeScript / React Native / Next.js.

---

## Stack technique

| Couche          | Technologie                              |
| --------------- | ---------------------------------------- |
| Backend         | Node.js · Express · TypeScript           |
| ORM             | Prisma 7                                 |
| Base de données | PostgreSQL (Supabase)                    |
| Auth            | JWT · Refresh token                      |
| Scraping        | Playwright · API France Travail · Indeed |
| Web             | Next.js · TypeScript                     |
| Mobile          | React Native · Expo                      |
| Déploiement     | Vercel (web) · Railway (API)             |

---

## Fonctionnalités

- **Scraping automatique** — France Travail (API officielle) · Indeed (Playwright) — 2 fois par jour (8h et 18h)
- **Filtres personnalisés par utilisateur** — stacks exclues, mots-clés, entreprises, zone géographique, télétravail
- **Gestion des offres expirées** — marquage automatique et suppression après 60 jours sans candidature
- **Suivi des candidatures** — statuts (à lire, postulée, entretien, refus, offre)
- **Suivi des entretiens** — types (phone, technical, fit, final), date, notes
- **Rappels de relance** — alerte automatique configurable (défaut J+7)
- **Pagination** — 30 offres par page
- **Multi-utilisateurs** — comptes isolés, données strictement séparées
- **Dashboard web** — vue d'ensemble sur PC
- **App mobile** — consultation et mise à jour des statuts sur iOS / Android

---

## Avancement

| Module                                     | Statut     |
| ------------------------------------------ | ---------- |
| Auth (signup, signin, refresh token)       | ✅ Terminé |
| Modèle de données (Prisma)                 | ✅ Terminé |
| CRUD offres d'emploi                       | ✅ Terminé |
| Filtres utilisateur (CRUD + localisation)  | ✅ Terminé |
| Pagination des offres                      | ✅ Terminé |
| Scraper France Travail                     | ✅ Terminé |
| Scraper Indeed                             | ✅ Terminé |
| Gestion des candidatures                   | ✅ Terminé |
| Suivi des entretiens                       | ✅ Terminé |
| Cron jobs (scraping · rappels · nettoyage) | ✅ Terminé |
| Dashboard web (Next.js)                    | ⏳ À venir |
| App mobile (React Native)                  | ⏳ À venir |

---

## Architecture

```
Esperanza-JobTracker/
├── api/          # Backend Node.js / TypeScript / Prisma
├── web/          # Dashboard Next.js
└── mobile/       # App React Native / Expo
```

---

## Structure API

```
api/src/
├── auth/               # JWT, middleware d'authentification
├── users/              # Inscription, connexion, refresh token
├── jobs/               # CRUD offres d'emploi
├── applications/       # Gestion des candidatures
├── interviews/         # Suivi des entretiens
├── scrapers/
│   ├── base.scraper.ts         # Interface commune (pattern adapter)
│   ├── francetravail/          # API officielle France Travail
│   └── indeed/                 # Scraping Indeed via Playwright
├── filters/            # Filtres personnalisés par utilisateur
├── cron/               # Jobs planifiés (scraping · rappels · nettoyage)
├── prisma/             # Client Prisma
└── app.ts
```

---

## Routes API

| Méthode | Route                        | Description                       |
| ------- | ---------------------------- | --------------------------------- |
| POST    | `/users/signup`              | Inscription                       |
| POST    | `/users/signin`              | Connexion                         |
| POST    | `/users/refresh`             | Renouvellement du token           |
| GET     | `/users/me`                  | Profil utilisateur                |
| GET     | `/jobs?page=1`               | Liste des offres paginées         |
| PATCH   | `/jobs/:id/status`           | Mise à jour du statut d'une offre |
| POST    | `/jobs/scrape`               | Lancer le scraping manuellement   |
| GET     | `/filters`                   | Récupérer les filtres utilisateur |
| PUT     | `/filters`                   | Mettre à jour les filtres         |
| DELETE  | `/filters`                   | Supprimer les filtres             |
| POST    | `/applications`              | Créer une candidature             |
| GET     | `/applications`              | Liste des candidatures            |
| PATCH   | `/applications/:id`          | Mettre à jour une candidature     |
| DELETE  | `/applications/:id`          | Supprimer une candidature         |
| POST    | `/interviews`                | Créer un entretien                |
| GET     | `/interviews/:applicationId` | Liste des entretiens              |
| PATCH   | `/interviews/:id`            | Mettre à jour un entretien        |
| DELETE  | `/interviews/:id`            | Supprimer un entretien            |

---

## Modèle de données

```prisma
User          — compte utilisateur (email, username, passwordHash)
UserFilters   — filtres personnalisés (stacks, mots-clés, localisation, délai de relance...)
JobOffer      — offre d'emploi scrapée (lastSeenAt pour gestion expiration)
Application   — candidature liée à une offre (statut, notes, followUpAt)
Interview     — entretiens liés à une candidature (type, date, notes)
```

---

## Cron jobs

| Heure | Action                          |
| ----- | ------------------------------- |
| 8h    | Scraping automatique des offres |
| 9h    | Envoi des rappels de relance    |
| 18h   | Scraping automatique des offres |
| 2h    | Nettoyage des offres expirées   |

---

## Lancer en local

### Prérequis

- Node.js 18+
- PostgreSQL (ou compte Supabase)
- Yarn

### Backend

```bash
cd api
yarn install
cp .env.example .env   # remplir les variables
npx prisma migrate dev
yarn dev
```

### Variables d'environnement (`api/.env`)

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=your_secret
REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
REFRESH_EXPIRES_IN=30d
PORT=3000
FRANCE_TRAVAIL_CLIENT_ID=PAR_...
FRANCE_TRAVAIL_CLIENT_SECRET=...
```

---

## Auteur

**Cédric Auneau** — [cedric-auneau.dev](https://www.cedric-auneau.dev) · [LinkedIn](https://www.linkedin.com/in/cedric-auneau) · auneau.dev@gmail.com
