# Swimmy Clone

Un clone complet de Swimmy (location de piscines entre particuliers) avec Next.js 14, TypeScript, Tailwind CSS, shadcn, Prisma, Supabase et MangoPay.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn
- Prisma (ORM)
- Supabase (PostgreSQL + Auth)
- MangoPay (paiements, sandbox)
- Hébergement Vercel

## Installation

1. **Cloner le repo**
2. **Installer les dépendances**
   ```bash
   npm install
   ```
3. **Configurer l'environnement**
   - Copier `.env.example` en `.env.local` et remplir les variables
4. **Initialiser la base de données**
   ```bash
   npx prisma migrate dev
   ```
5. **Démarrer Supabase localement (optionnel)**
   ```bash
   npx supabase start
   ```
6. **Lancer le projet**
   ```bash
   npm run dev
   ```

## Déploiement Vercel

- Connecter le repo à Vercel
- Renseigner les variables d'environnement dans le dashboard Vercel
- Déployer

## MangoPay (Sandbox)

- Utilise les credentials MangoPay sandbox
- Webhooks à configurer sur `/api/webhooks/mangopay`
- Voir la doc MangoPay pour tester les paiements

## Scripts utiles

- `npx prisma studio` : interface admin base de données
- `npx shadcn@latest add` : ajouter un composant UI shadcn

## Structure du projet

- `app/` : pages Next.js (App Router)
- `components/` : composants UI
- `lib/` : helpers, clients, SDK
- `prisma/` : schéma et migrations

## Fonctionnalités principales

- Authentification (email/password)
- Gestion des piscines (CRUD)
- Réservations et paiements MangoPay
- Dashboard locataire/propriétaire
- Webhooks MangoPay

---

Pour toute question, voir la doc ou ouvrir une issue !
