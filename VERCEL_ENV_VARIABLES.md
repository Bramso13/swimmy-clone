# Variables d'environnement nécessaires pour Vercel

Pour que le site fonctionne correctement sur Vercel, vous devez configurer les variables d'environnement suivantes dans les paramètres de votre projet Vercel :

## Variables obligatoires

### Base de données
- `DATABASE_URL` - URL de connexion à la base de données PostgreSQL (ex: `postgresql://user:password@host:port/database`)

### Authentification
- `BETTER_AUTH_SECRET` - Secret pour l'authentification Better Auth (générer une chaîne aléatoire sécurisée)

### Stripe (Paiements)
- `STRIPE_SECRET_KEY` - Clé secrète Stripe (commence par `sk_`)
- `STRIPE_WEBHOOK_SECRET` - Secret du webhook Stripe (commence par `whsec_`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Clé publique Stripe (commence par `pk_`)

## Variables optionnelles mais recommandées

### Application
- `NEXT_PUBLIC_APP_URL` - URL de votre application (ex: `https://votre-site.vercel.app`)
  - Si non définie, Vercel utilisera automatiquement `NEXT_PUBLIC_VERCEL_URL`

### Email (Nodemailer)
- `SMTP_HOST` - Serveur SMTP (ex: `smtp.gmail.com`, `smtp.sendgrid.net`)
- `SMTP_PORT` - Port SMTP (généralement `587` ou `465`)
- `SMTP_USER` - Nom d'utilisateur SMTP
- `SMTP_PASSWORD` - Mot de passe SMTP
- `SMTP_FROM_EMAIL` - Email expéditeur (optionnel, utilise `SMTP_USER` par défaut)
- `SMTP_SECURE` - `true` pour le port 465, `false` pour le port 587 (optionnel)

## Comment configurer sur Vercel

1. Allez sur votre projet Vercel
2. Cliquez sur **Settings** → **Environment Variables**
3. Ajoutez chaque variable avec sa valeur
4. Sélectionnez les environnements (Production, Preview, Development)
5. Redéployez votre application

## Vérification

Après avoir configuré les variables, vérifiez que :
- ✅ Le build passe sans erreur (`npm run build`)
- ✅ L'authentification fonctionne
- ✅ Les paiements Stripe fonctionnent
- ✅ Les emails sont envoyés correctement

## Notes importantes

- Les variables `NEXT_PUBLIC_*` sont exposées au client et doivent être publiques
- Ne partagez jamais les secrets (`STRIPE_SECRET_KEY`, `BETTER_AUTH_SECRET`, etc.)
- Pour `BETTER_AUTH_SECRET`, générez une chaîne aléatoire de 32 caractères minimum
- Pour Stripe, utilisez les clés de test en développement et les clés de production en production

