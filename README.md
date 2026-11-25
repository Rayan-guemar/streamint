# Stream'Int

## Prérequis

- **Python 3.12 ou supérieur** (testé avec Python 3.13.5)
- **Git**
- **Docker**
- **Docker Compose**

---

## Installation et lancement (macOS/Linux)

Depuis la racine du projet :

### 1. Créer et activer l'environnement virtuel

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Installer les dépendances Python

```bash
python -m pip install -r requirements.txt
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à partir du fichier fourni `.env.example` :

```bash
cp .env.example .env
```

Modifier le fichier `.env` pour renseigner un mot de passe PostgreSQL dans la variable `DB_PASSWORD`.

Chaque développeur peut choisir son propre mot de passe avant la première initialisation de sa base de données.

Le fichier `.env` est ignoré par Git afin de ne pas partager les identifiants de connexion.

### 4. Démarrer la base de données PostgreSQL

S'assurer que Docker est démarré, puis exécuter :

```bash
docker compose up -d
```

Vérifier que le conteneur fonctionne :

```bash
docker compose ps
```

La base de données PostgreSQL est accessible localement sur le port 5433.

Attendre que PostgreSQL soit prêt à recevoir des connexions avant de passer à l'étape suivante. Pour consulter les journaux :

```bash
docker compose logs postgres
```

### 5. Appliquer les migrations Django

```bash
python manage.py migrate
```

Cette commande crée les tables nécessaires au fonctionnement de l'application dans la base PostgreSQL.

### 6. Créer un compte administrateur (facultatif)

```bash
python manage.py createsuperuser
```

### 7. Lancer le serveur Django

```bash
python manage.py runserver
```

- Application : http://127.0.0.1:8000/
- Administration : http://127.0.0.1:8000/admin/

---

## Arrêt de l'application

Pour arrêter le serveur Django, utiliser `Ctrl + C`.

Pour arrêter les services Docker :

```bash
docker compose down
```

Les données PostgreSQL sont conservées grâce à un volume Docker persistant. Ne pas utiliser l'option `-v` si l'on souhaite conserver les données.

---

## Redémarrage de l'application

Après la première installation, depuis la racine du projet :

```bash
source .venv/bin/activate
docker compose up -d
```

Une fois PostgreSQL prêt :

```bash
python manage.py migrate
python manage.py runserver
```
