# Esperanza — Job Tracker

> 🚧 **Projet en cours de développement** — backend en place, web et mobile à venir.

Application fullstack de suivi de recherche d'emploi — scraping automatique des offres, gestion des candidatures et rappels de relance.

Construite en autonomie avec Node.js / TypeScript / React Native / Next.js.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | Node.js · Express · TypeScript |
| ORM | Prisma 7 |
| Base de données | PostgreSQL (Supabase) |
| Auth | JWT · Refresh token |
| Scraping | Playwright · API France Travail · BetaGouv |
| Web | Next.js · TypeScript |
| Mobile | React Native · Expo |
| Déploiement | Vercel (web) · Railway (API) |

---

## Fonctionnalités

- **Scraping automatique** — France Travail (API officielle), WTTJ (Playwright), BetaGouv
- **Filtrage intelligent** — élimination automatique des offres hors stack (Java, PHP, Angular, .NET...) et des postes senior
- **Suivi des candidatures** — statuts (à lire, postulée, entretien, refus, offre)
- **Rappels de relance** — alerte automatique à J+7 si pas de réponse
- **Multi-utilisateurs** — comptes isolés, données strictement séparées
- **Dashboard web** — vue d'ensemble sur PC
- **App mobile** — consultation et mise à jour des statuts sur iOS / Android

---

## Avancement

| Module | Statut |
|---|---|
| Auth (signup, signin, refresh token) | ✅ Terminé |
| Modèle de données (Prisma) | ✅ Terminé |
| CRUD offres d'emploi | 🔄 En cours |
| Scraper France Travail | 🔄 En cours |
| Scraper WTTJ | ⏳ À venir |
| Scraper BetaGouv | ⏳ À venir |
| Cron job (scraping + rappels) | ⏳ À venir |
| Dashboard web (Next.js) | ⏳ À venir |
| App mobile (React Native) | ⏳ À venir |

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
│   ├── wttj/                   # Scraping WTTJ via Playwright
│   └── betagouv/               # Scraping BetaGouv
├── filters/            # Filtrage automatique des offres
├── cron/               # Jobs planifiés (scraping quotidien, rappels)
├── prisma/             # Client Prisma
└── app.ts
```

---

## Modèle de données

```prisma
User          — compte utilisateur (email, username, passwordHash)
JobOffer      — offre d'emploi scrapée ou ajoutée manuellement
Application   — candidature liée à une offre (statut, notes, followUp)
Interview     — entretiens liés à une candidature
```

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
```

---

## Auteur

**Cédric Auneau** — [cedric-auneau.dev](https://www.cedric-auneau.dev) · [LinkedIn](https://www.linkedin.com/in/cedric-auneau) · auneau.dev@gmail.com
