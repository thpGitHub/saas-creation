# SocialPost

## Présentation

**SocialPost** est une application web moderne permettant de planifier, rédiger, publier et gérer des posts sur plusieurs réseaux sociaux (LinkedIn, Twitter, Facebook, Instagram). L'interface est pensée pour la simplicité, la rapidité et l'automatisation, avec une intégration de l'IA pour la génération de contenu.

---

## Fonctionnalités principales

- **Authentification sécurisée** (inscription, connexion, déconnexion)
- **Tableau de bord** :
  - Affichage des 3 derniers posts publiés
  - Affichage des 3 prochains posts planifiés
- **Création de posts** :
  - Sélection du réseau social (LinkedIn, Twitter, Facebook, Instagram)
  - Génération de contenu assistée par IA (OpenAI)
  - Prévisualisation et édition du post avant publication
  - Planification à une date/heure précise ou publication immédiate
  - (Pour LinkedIn) Upload d'image (stockage à venir)
- **Gestion des posts** :
  - Liste complète des posts publiés
  - Liste complète des posts planifiés
  - Modification/suppression des posts planifiés
- **Historique de connexion** (pour audit et sécurité)
- **Navigation responsive** (desktop/mobile) avec menu burger

---

## Stack technique

- **Next.js 13+ (App Router)**
- **React 18**
- **TypeScript**
- **SQLite** (via better-sqlite3)
- **TailwindCSS** (UI moderne et custom)
- **OpenAI API** (génération de texte)
- **Make.com** (webhooks pour automatisation multi-réseaux)
- **bcryptjs** (hash des mots de passe)
- **uuid** (identifiants uniques)

---

## Installation & Lancement

```bash
git clone <repo>
cd <repo>
npm install
# Configure .env.local avec tes clés (voir .env.example)
npm run dev
```

- Accède à l'app sur [http://localhost:3000](http://localhost:3000)
- Les données sont stockées dans `data/database.sqlite` (créée automatiquement)

---

## Configuration

Crée un fichier `.env.local` à la racine avec :

```
OPENAI_API_KEY=sk-...
MAKE_WEBHOOK_LINKEDIN_URL=...
MAKE_WEBHOOK_TWITTER_URL=...
MAKE_WEBHOOK_FACEBOOK_URL=...
MAKE_WEBHOOK_INSTAGRAM_URL=...
NODE_ENV=development
```

---

## Fonctionnement de l'IA et génération de contenu

Notre application utilise l'API OpenAI pour générer automatiquement du contenu optimisé pour différents réseaux sociaux.

### Intégration avec OpenAI

- Utilisation de l'API officielle OpenAI via le package `openai`
- Support de plusieurs modèles (GPT-3.5-Turbo, GPT-4, GPT-4-Turbo)
- Configuration flexible de la longueur du contenu généré (post court, moyen, long)

### Prompts spécialisés par réseau social

Chaque réseau social dispose d'un prompt spécifique adapté à ses particularités :

- **LinkedIn** : Contenu professionnel et informatif avec un ton d'autorité
- **Twitter** : Posts concis (280 caractères max) avec un ton conversationnel
- **Facebook** : Contenu engageant avec un ton plus personnel
- **Instagram** : Descriptions visuelles et émotionnelles avec hashtags pertinents

### Système de planification

- Publication immédiate ou programmée
- Timer JavaScript pour les publications à court terme
- Gestion des dates lointaines dans la base de données
- Vérification automatique et mise à jour des statuts des posts expirés

### Intégration avec Make.com

Les posts générés sont envoyés à Make.com via des webhooks personnalisés pour chaque réseau social, permettant une publication automatisée sur les plateformes.

---

## Structure des dossiers

- `/src/app` : pages Next.js (dashboard, login, register, create, published-posts, scheduled-posts)
- `/src/components` : composants UI (Navbar, PostList, ScheduledPosts, PreviewModal, etc)
- `/src/context` : AuthContext (gestion de l'auth globale)
- `/src/lib` : db.ts (connexion et migrations SQLite)
- `/src/services` : scheduler.js (planification des posts)
- `/src/app/api` : routes API (auth, posts, planification, preview IA, etc)
- `/public/icons` : icônes SVG des réseaux sociaux

---

## Roadmap & Développements futurs

### 1. **Stockage et affichage des images**
- **Actuel** : L'upload d'image est possible pour LinkedIn, mais l'image n'est pas stockée ni affichée.
- **À venir** :
  - Stockage des images sur le filesystem local, S3, ou un bucket cloud.
  - Ajout d'un champ `image` dans la table `posts` (URL ou binaire).
  - Affichage de l'image dans les listes de posts publiés/planifiés et dans la prévisualisation.
  - Sécurité : validation du type et de la taille, nettoyage des fichiers orphelins.

### 2. **Pricing & monétisation**
- **À venir** :
  - Mise en place d'un système de plans (gratuit, premium, pro...)
  - Limitation du nombre de posts planifiables selon le plan
  - Paiement via Stripe ou LemonSqueezy
  - Gestion des abonnements, factures, annulation, etc.
  - UI dédiée pour l'upgrade/downgrade

### 3. **Support multi-utilisateurs avancé**
- Gestion d'équipes, rôles (admin, éditeur...)
- Partage de posts entre membres d'une équipe

### 4. **Analytics avancées**
- Statistiques d'engagement (likes, commentaires, partages) par réseau
- Graphiques d'évolution, export CSV

### 5. **Automatisation & intégrations**
- Intégration Zapier/Make.com pour d'autres réseaux ou workflows
- Publication automatique sur d'autres plateformes (TikTok, Pinterest...)

### 6. **Sécurité & RGPD**
- Suppression automatique des données sur demande
- Export des données utilisateur
- 2FA (authentification à deux facteurs)

---

## Contribution

PR et suggestions bienvenues !  
Merci de créer une issue pour toute demande de fonctionnalité ou bug.

---

## Licence

MIT

---

**Contact** :  
Pour toute question ou projet sur-mesure, contacte-moi sur [GitHub](https://github.com/) ou par mail.
