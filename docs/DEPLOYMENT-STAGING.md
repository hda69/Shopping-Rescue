# Déploiement staging — Shopping Rescue

Guide pour déployer **web + worker + PostgreSQL** sur [Railway](https://railway.app) (recommandé pour ce monorepo : Next.js + Playwright worker).

Repo GitHub : `https://github.com/hda69/Shopping-Rescue`

---

## Architecture staging

| Service | Rôle | Port |
|---------|------|------|
| **postgres** | Base de données | 5432 (interne) |
| **web** | Next.js (UI, API, PDF) | 3000 |
| **worker** | Scans Playwright + jobs | 3001 (health) |

---

## 1. Créer le projet Railway

1. [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → `hda69/Shopping-Rescue`
3. Branche : `master` ou `feat/i18n-fr-en-complete`

---

## 2. PostgreSQL

1. Dans le projet → **+ New** → **Database** → **PostgreSQL**
2. Railway crée `DATABASE_URL` automatiquement
3. **Partager** cette variable avec les services `web` et `worker` (Railway → service → Variables → Reference)

---

## 3. Service **web** (détaillé)

> **État actuel du projet Railway `amusing-enchantment` :**  
> le service nommé `Shopping-Rescue` tourne déjà le **worker**  
> (`https://shopping-rescue-production.up.railway.app/health` → OK).  
> Il faut un **2ᵉ service** pour le site Next.js.

### 3.1 Créer le service

1. **+ New** → **GitHub Repo** → `hda69/Shopping-Rescue`
2. Branche : **`feat/i18n-fr-en-complete`**
3. **Settings** → **Build** :
   - **Builder** : **Dockerfile** (pas Railpack)
   - **Root Directory** : `/` (racine)
   - **Dockerfile Path** : `apps/web/Dockerfile`
   - **Config file** (si proposé) : `apps/web/railway.json`
4. **Networking** → **Generate Domain**  
   Exemple : `shopping-rescue-web-xxxx.up.railway.app`  
   (pas besoin de domaine custom en staging)
5. (Optionnel) renommer le service → `web`

### 3.2 Variables web

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXT_PUBLIC_APP_URL=https://TON-DOMAINE-WEB.up.railway.app

# Worker déjà en ligne sur le service Shopping-Rescue :
WORKER_HEALTH_URL=https://shopping-rescue-production.up.railway.app/health

# Stripe (mode test)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_FULL_AUDIT=price_...

BILLING_DEV_UNLOCK=false
```

Après le premier domain généré, mets à jour `NEXT_PUBLIC_APP_URL` avec l’URL réelle, puis **Redeploy**.

### 3.3 Vérifier le deploy

| Check | Attendu |
|-------|---------|
| Build logs | plus d’erreur `GID 1001` |
| Runtime | pas de crash immédiat |
| `GET https://TON-DOMAINE-WEB/api/health` | `"database":"connected"` |
| `GET https://TON-DOMAINE-WEB/` | page d’accueil Shopping Rescue |

### 3.4 Erreurs build web fréquentes

| Erreur | Fix |
|--------|-----|
| `GID 1001 is already in use` | déjà corrigé (UID 10001) — branche à jour |
| Railpack / No start command | Builder = **Dockerfile** |
| Build long / timeout | image Playwright lourde — attendre 5–10 min |

---

## 4. Service **worker** (détaillé)

Le **worker** est indispensable en staging : sans lui, les scans restent bloqués à ~10 % (job créé en base, mais personne ne le traite).

### Rôle du worker

| Fonction | Détail |
|----------|--------|
| Polling jobs | Lit la file PostgreSQL toutes les ~2 s |
| `FREE_SITE_SCAN` | Crawl Playwright + règles + score + email (si Resend) |
| Health HTTP | `GET /health` sur le port Railway (`PORT`, souvent 8080) |

Le service **web** appelle `WORKER_HEALTH_URL` pour afficher « worker online/offline » sur la page résultats.

---

### 4.1 Créer le service sur Railway

1. Dans le **même projet Railway** que Postgres et web → **+ New** → **GitHub Repo**
2. Choisir **`hda69/Shopping-Rescue`** (même repo que web)
3. Railway crée un **3ᵉ service** (en plus de Postgres et web)

> **Important :** ce n’est pas un second déploiement du web. C’est un service **séparé** avec son propre build et ses propres variables.

---

### 4.2 Configurer le build Docker

Ouvrir le service worker → **Settings** → **Build** :

| Champ Railway | Valeur | Pourquoi |
|---------------|--------|----------|
| **Builder** | **Dockerfile** | ⚠️ **Obligatoire** — Railpack échoue sur ce monorepo (pas de `start` à la racine) |
| **Root Directory** | `/` (racine du repo) | Le Dockerfile copie `packages/` + `apps/worker/` |
| **Dockerfile Path** | `apps/worker/Dockerfile` | Chemin exact dans le repo |
| **Config file** (si proposé) | `apps/worker/railway.json` | Force Dockerfile via config-as-code |
| **Watch Paths** (optionnel) | `apps/worker/**`, `packages/**` | Redéploie si worker ou packages changent |

**Ne pas** mettre `apps/worker` comme Root Directory : le Dockerfile s’attend à être lancé depuis la **racine** du monorepo.

#### Contenu du Dockerfile worker (référence)

Fichier : `apps/worker/Dockerfile`

```dockerfile
FROM mcr.microsoft.com/playwright:v1.61.1-noble   # Chromium + deps système
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY packages ./packages
COPY apps/worker ./apps/worker
RUN pnpm install
WORKDIR /app/apps/worker
ENV NODE_ENV=production
ENV WORKER_HEALTH_PORT=3001
EXPOSE 3001
CMD ["pnpm", "start"]   # → tsx src/index.ts
```

Points clés :
- Image **Playwright officielle** : sans elle, le crawl échoue en prod (pas de Chromium).
- `pnpm install` à la racine : installe les dépendances workspace (`@shopping-rescue/database`, `scanner`, etc.).
- `pnpm start` lance le worker en mode production (pas `dev` / watch).

---

### 4.3 Premier déploiement

1. **Deploy** (ou attendre le deploy auto après push GitHub)
2. Ouvrir **Deployments** → dernier build → **View logs**
3. Build OK si vous voyez quelque chose comme :
   - `Successfully built`
   - au démarrage : logs worker + écoute sur le port health

**Durée typique du build :** 3–8 min (image Playwright + `pnpm install`).

#### Erreurs de build fréquentes

| Erreur | Cause | Fix |
|--------|--------|-----|
| `COPY packages: not found` | Root Directory = `apps/worker` | Remettre Root Directory à `/` |
| `Dockerfile not found` | Mauvais chemin | `apps/worker/Dockerfile` (pas `Dockerfile` seul) |
| `pnpm: not found` | Image de base incorrecte | Garder le Dockerfile du repo tel quel |
| Timeout build | Image lourde | Relancer le deploy ; Railway Hobby peut être lent |

---

### 4.4 Variables d'environnement (worker)

Service worker → **Variables** :

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
WORKER_HEALTH_PORT=3001
```

| Variable | Obligatoire | Notes |
|----------|-------------|-------|
| `DATABASE_URL` | Oui | Référencer la variable Postgres Railway (`${{Postgres.DATABASE_URL}}`) |
| `WORKER_HEALTH_PORT` | Recommandé | `3001` — doit correspondre au port exposé |
| `RESEND_API_KEY` | Non (pour l’instant) | À ajouter plus tard pour les emails |
| `RESEND_FROM_EMAIL` | Non | Idem |

**Pas besoin** sur le worker pour le staging minimal :
- clés Stripe (côté **web** uniquement)
- `NEXT_PUBLIC_APP_URL`

Après ajout des variables → **Redeploy** le worker.

---

### 4.5 Réseau : domaine public + port

Le web doit pouvoir appeler le health check du worker depuis Internet.

1. Service worker → **Settings** → **Networking**
2. **Generate Domain** → ex. `shopping-rescue-worker-staging.up.railway.app`
3. Vérifier que le service **écoute sur le port Railway** :
   - Railway injecte souvent `PORT` ; notre worker utilise `WORKER_HEALTH_PORT=3001` en interne.
   - Si le health ne répond pas via le domaine public, dans **Networking** → **Public Networking** → cibler le port **3001** (selon UI Railway).

4. Test dans le navigateur ou curl :

```bash
curl https://shopping-rescue-worker-staging.up.railway.app/health
```

Réponse attendue :

```json
{ "status": "ok", "queuedJobCount": 0 }
```

Si `503` + `Database unavailable` → `DATABASE_URL` manquant ou Postgres inaccessible.

---

### 4.6 Lier le worker au service web

1. Copier l’URL du worker (sans slash final) :
   `https://shopping-rescue-worker-staging.up.railway.app`
2. Service **web** → **Variables** → ajouter ou modifier :

```env
WORKER_HEALTH_URL=https://shopping-rescue-worker-staging.up.railway.app/health
```

3. **Redéployer le service web** (obligatoire après changement de variable)

Sans cette étape, le site staging affiche « worker offline » et les scans peuvent sembler bloqués même si le worker tourne.

---

### 4.7 Vérifier que le worker traite bien les scans

1. Ouvrir `https://VOTRE-DOMAINE-WEB/fr/free-scan`
2. Lancer un scan test (ex. `https://example.com`)
3. Sur Railway → service **worker** → **Logs** (runtime), vous devez voir :
   - `Job claimed` / `FREE_SITE_SCAN`
   - `Starting free site scan`
   - `Crawling page` …
   - `FREE_SITE_SCAN completed`

4. Page résultats : progression > 10 %, puis statut `completed`

| Symptôme | Diagnostic |
|----------|------------|
| Bloqué à 10 % | Worker pas déployé, crash, ou `DATABASE_URL` incorrect |
| Worker offline sur l’UI | `WORKER_HEALTH_URL` absent ou mauvaise URL sur **web** |
| Job claimed puis erreur | Voir logs worker (Playwright timeout, URL invalide, etc.) |

---

### 4.8 Test build Docker en local (optionnel)

Depuis la racine du repo :

```bash
docker build -f apps/worker/Dockerfile -t shopping-rescue-worker .
docker run --rm -e DATABASE_URL="postgresql://..." -e WORKER_HEALTH_PORT=3001 -p 3001:3001 shopping-rescue-worker
```

Puis `curl http://localhost:3001/health`.

Utile si le build Railway échoue et que vous voulez reproduire l’erreur en local.

---

### 4.9 Récap ordre des opérations (worker)

1. Créer le service GitHub (même repo)
2. `Dockerfile Path` = `apps/worker/Dockerfile`, Root = `/`
3. Variables : `DATABASE_URL`, `WORKER_HEALTH_PORT=3001`
4. Deploy + vérifier les logs de build
5. Generate Domain + test `/health`
6. Copier l’URL dans `WORKER_HEALTH_URL` sur **web**
7. Redéployer **web**
8. Lancer un scan test

---

## 5. Migrations base de données

Une fois Postgres + web déployés, depuis votre machine (avec [Railway CLI](https://docs.railway.app/guides/cli)) :

```bash
npm i -g @railway/cli
railway login
railway link
```

Puis :

```bash
railway run pnpm db:migrate
railway run pnpm db:seed
```

Ou en one-off dans Railway : service **web** → **Settings** → **Deploy** → commande de release personnalisée (si configurée) :

```bash
pnpm db:migrate && pnpm db:seed
```

---

## 6. Stripe webhook (staging)

1. [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks) → **Add endpoint**
2. URL : `https://VOTRE-DOMAINE-WEB.up.railway.app/api/webhooks/stripe`
3. Événements :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copier le **Signing secret** → `STRIPE_WEBHOOK_SECRET` sur Railway (web)
5. Redéployer **web**

### Monitoring Pro (€49/mo)

1. Stripe → Products → créer un prix **récurrent mensuel** €49
2. Copier l’ID `price_...` → variable web `STRIPE_PRICE_MONITORING_PRO`
3. Ajouter `CRON_SECRET` (string aléatoire) sur le service **web**
4. Planifier un cron (Railway Cron / externe) chaque jour :

```bash
curl -X POST "https://VOTRE-DOMAINE-WEB.up.railway.app/api/cron/weekly-scans" \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

Le cron file les jobs `WEEKLY_MONITORING_SCAN` ; le **worker** les traite automatiquement.

---

## 7. Vérifications

| Test | URL / action | Attendu |
|------|----------------|---------|
| Health web | `GET /api/health` | `"database": "connected"` |
| Health worker | `GET /health` sur domaine worker | `"status": "ok"` |
| Scan gratuit | `/fr/free-scan` | job traité, progression puis résultats |
| Checkout | débloquer rapport | Stripe test `4242...` |
| PDF | télécharger PDF | fichier FR/EN selon locale scan |

---

## 8. Checklist sécurité staging

- [ ] `BILLING_DEV_UNLOCK=false`
- [ ] Clés Stripe **test** uniquement (`sk_test_`, `pk_test_`)
- [ ] `.env` local **jamais** commité
- [ ] `NEXT_PUBLIC_APP_URL` = URL HTTPS réelle (pas `localhost`)

---

## Dépannage

### Railpack — « No start command detected »

**Symptôme dans les logs :**
```
using build driver railpack-v0.31.1
✖ No start command detected
```

**Cause :** Railway utilise **Railpack** (auto Node) au lieu du **Dockerfile**. Le `package.json` à la racine du monorepo n’a pas de script `start` — seuls `dev`, `build`, etc. existent.

**Correction (choisir une méthode) :**

#### Méthode A — Interface Railway (recommandé)

1. Ouvrir le service (**web** ou **worker**)
2. **Settings** → **Build**
3. **Builder** → passer de **Railpack** à **Dockerfile**
4. **Dockerfile Path** :
   - web : `apps/web/Dockerfile`
   - worker : `apps/worker/Dockerfile`
5. **Root Directory** : laisser vide ou `/` (racine du repo)
6. **Redeploy**

#### Méthode B — Fichier config (déjà dans le repo)

Fichiers ajoutés :
- `apps/web/railway.json`
- `apps/worker/railway.json`

Dans Railway → service → **Settings** → indiquer le **Config file path** :
- web : `apps/web/railway.json`
- worker : `apps/worker/railway.json`

Puis **Redeploy**.

#### Méthode C — Variable d’environnement

Sur le service concerné, ajouter :

```env
RAILWAY_DOCKERFILE_PATH=apps/worker/Dockerfile
```

(ou `apps/web/Dockerfile` pour le web) **et** forcer Builder = Dockerfile dans Settings.

---

### Health URL worker = 404 / ne marche pas

**Cause :** Railway expose le domaine public sur la variable `PORT`. Le worker écoutait seulement sur `WORKER_HEALTH_PORT=3001` → le proxy renvoie **404**.

**Correction (déjà dans le code) :** le health server utilise `PORT` (Railway) en priorité, sinon `WORKER_HEALTH_PORT`, sinon `3001`, et écoute sur `0.0.0.0`.

Après push + redeploy du worker :

1. Vérifie dans les **logs worker** : `Worker started` avec `healthPort` = la valeur de `PORT` Railway
2. Ouvre : `https://shopping-rescue-worker-staging.up.railway.app/health`
3. Attendu : `{"status":"ok","queuedJobCount":0}` (ou 503 si DB pas liée)

Sur Railway worker → **Settings** → **Networking** :
- domaine public généré
- pas besoin de forcer le port 3001 si le code utilise `PORT`

### Vérifier que les tables existent (PowerShell)

```powershell
$env:DATABASE_URL="postgresql://postgres:MOT_DE_PASSE@tokaido.proxy.rlwy.net:51591/railway"
pnpm --filter @shopping-rescue/database exec tsx ./scripts/check-tables.ts
```

Attendu : `OK: scan_jobs exists`

---

### Scan bloqué / worker offline

- Vérifier `WORKER_HEALTH_URL` sur **web** pointe vers le bon domaine worker
- Logs worker : jobs `FREE_SITE_SCAN` doivent apparaître

### Checkout OK mais rapport pas débloqué

- Webhook Stripe mal configuré ou `STRIPE_WEBHOOK_SECRET` incorrect
- Vérifier logs web : `/api/webhooks/stripe`

### PDF échoue

- Le Dockerfile web inclut Playwright/Chromium
- `NEXT_PUBLIC_APP_URL` doit être accessible depuis le conteneur web (même domaine public)

### Build Docker échoue

```bash
docker build -f apps/web/Dockerfile -t sr-web .
docker build -f apps/worker/Dockerfile -t sr-worker .
```

---

## Alternative : Vercel (web) + Railway (worker + DB)

Possible mais plus complexe (2 plateformes, CORS, `WORKER_HEALTH_URL`, PDF Playwright sur Vercel difficile). **Railway tout-en-un** est plus simple pour le staging initial.
