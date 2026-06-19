# 🔐 Autorank Bot

Bot Discord d'auto-attribution de rôle via mot-clé, avec panel interactif et système de permissions owners/buyers.

[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2.svg)](https://discord.js.org/)

🇫🇷 [Français](#-français) · 🇬🇧 [English](#-english)

---

## 🇫🇷 Français

### Fonctionnalités

- Panel auto-rôle (choix du rôle + mot-clé) via menu déroulant et bouton
- Système de permissions : `owners` (modifiables via commande) et `buyers` (accès total, à éditer manuellement)
- Préfixe personnalisable
- Personnalisation du bot : statut, présence, photo de profil, bannière, footer
- Salon de logs configurable
- Commandes utilitaires : ping, clear, restart

### Installation

```bash
git clone https://github.com/Beep-Twix/Bot-AutoRank.git
cd Bot-AutoRank
npm install
```

Remplis le fichier `.env` avec ton token :
```env
TOKEN=ton_token_discord_ici
```

Ajoute ton ID Discord dans `owners.json` pour avoir accès aux commandes :
```json
{ "owners": ["ton_id_discord"] }
```

Lance le bot :
```bash
node bot.js
```

### Commandes

Préfixe par défaut : `+` (modifiable avec `+prefix`)

| Commande | Description |
|---|---|
| `help` | Liste des commandes |
| `panel` | Crée le panel d'auto-rôle |
| `prefix <préfixe>` | Change le préfixe |
| `owner @user` | Ajoute un owner |
| `unowner @user` | Retire un owner |
| `owners` | Liste des owners/buyers |
| `logs #salon` | Définit le salon de logs |
| `status <type> <texte>` | Change le statut du bot |
| `setpresence <online\|dnd\|idle\|invisible>` | Change la présence |
| `setpp <url>` | Change la photo de profil |
| `setbanner <url>` | Change la bannière |
| `footer <texte>` | Change le footer des embeds |
| `ping` | Affiche la latence |
| `clear <1-100>` | Supprime des messages |
| `restart` | Redémarre le bot |

> Toutes les commandes nécessitent d'être owner ou buyer.

---

## 🇬🇧 English

### Features

- Auto-role panel (role selection + keyword) via dropdown and button
- Permission system: `owners` (manageable via commands) and `buyers` (full access, manually edited)
- Customizable prefix
- Bot customization: status, presence, avatar, banner, embed footer
- Configurable log channel
- Utility commands: ping, clear, restart

### Installation

```bash
git clone https://github.com/Beep-Twix/Bot-AutoRank.git
cd Bot-AutoRank
npm install
```

Fill in the `.env` file with your token:
```env
TOKEN=your_discord_token_here
```

Add your Discord ID to `owners.json` to access the commands:
```json
{ "owners": ["your_discord_id"] }
```

Run the bot:
```bash
node bot.js
```

### Commands

Default prefix: `+` (changeable with `+prefix`)

| Command | Description |
|---|---|
| `help` | List of commands |
| `panel` | Creates the auto-role panel |
| `prefix <prefix>` | Changes the prefix |
| `owner @user` | Adds an owner |
| `unowner @user` | Removes an owner |
| `owners` | Lists owners/buyers |
| `logs #channel` | Sets the log channel |
| `status <type> <text>` | Changes the bot's status |
| `setpresence <online\|dnd\|idle\|invisible>` | Changes the presence |
| `setpp <url>` | Changes the avatar |
| `setbanner <url>` | Changes the banner |
| `footer <text>` | Changes the embed footer |
| `ping` | Shows latency |
| `clear <1-100>` | Deletes messages |
| `restart` | Restarts the bot |

> All commands require owner or buyer status.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — *projet sous licence MIT*.
