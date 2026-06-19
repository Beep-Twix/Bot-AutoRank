const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
} = require("discord.js");

require("dotenv").config();
const fs = require("fs");

// Chargement des données
let config = require("./config.json");
let prefixData = require("./prefix.json");
let panelData = require("./panel.json");
let ownersData = require("./owners.json");
let buyersData = require("./buyers.json");

// Création du bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Fonctions de sauvegarde
function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function saveAll() {
  save("./config.json", config);
  save("./prefix.json", prefixData);
  save("./panel.json", panelData);
  save("./owners.json", ownersData);
  save("./buyers.json", buyersData);
}

function isBuyer(id) {
  return buyersData.buyers.includes(id);
}
function isOwner(id) {
  return ownersData.owners.includes(id) || isBuyer(id);
}
const typeMap = {
  playing: 0,
  streaming: 1,
  listening: 2,
  watching: 3,
  competing: 5,
};
// Mise à jour auto du panel
async function updatePanel(guild) {
  if (!panelData.messageId || !panelData.channelId) return;
  const channel = guild.channels.cache.get(panelData.channelId);
  if (!channel) return;
  try {
    const msg = await channel.messages.fetch(panelData.messageId);
    const role = guild.roles.cache.get(config.roleId);
    const embed = new EmbedBuilder()
      .setTitle("🔐 Auto Rôle")
      .setColor(0x5865f2)
      .setDescription("👤 Seul l’auteur du panneau peut le modifier")
      .addFields(
        { name: "Mot-clé", value: config.keyword || "*Aucun*" },
        { name: "Rôle", value: role ? role.name : "*Aucun*" }
      );

    const options = guild.roles.cache
      .filter(r => r.name !== "@everyone" && r.editable)
      .map(r => ({ label: r.name, value: r.id }));

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`modifier_motcle`)
        .setLabel("✏️ Modifier mot-clé")
        .setStyle(ButtonStyle.Primary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`choix_role`)
        .setPlaceholder("Choisir un rôle")
        .addOptions(options)
    );

    await msg.edit({ embeds: [embed], components: [row2, row1] });
  } catch (err) {
    console.error("Erreur updatePanel:", err);
  }
}

client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  if (config.activity) client.user.setActivity(config.activity.text, { type: typeMap[config.activity.type] });
  if (config.presence) client.user.setPresence({ status: config.presence });
});
let globalFooter = "|*Autorank|"; // footer par défaut

// Commandes texte
client.on("messageCreate", async message => {
  if (message.author.bot || !message.guild) return;

  const prefix = prefixData.prefix || "*";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (["panel", "prefix", "owner", "unowner", "logs", "owners","help","status","setpresence","setpp","setbanner","footer", "restart", "ping"].includes(cmd) &&  !isOwner(message.author.id)) {
    return message.reply(`❌ <@${message.author.id}> vous n'êtes pas autorisé à utiliser cette commande.`);
  }
  if (cmd === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('📖 Liste des commandes')
      .setColor('#0099ff')
      .setDescription('Voici les commandes disponibles et leur description :')
      .addFields(
        { name: `${prefix}panel`, value: '⚙️ - Ouvre le panneau de configuration.' },
        { name: `${prefix}prefix <prefix>`, value: '❗- Change le préfixe du bot.' },
        { name: `${prefix}owner @user`, value: '👑 - Ajoute un owner.' },
        { name: `${prefix}unowner @user`, value: '❌ - Retire un owner.' },
        { name: `${prefix}owners`, value: '❔ - Affiche la liste des owners.' },
        { name: `${prefix}logs #channel`, value: '📁 - Configure le salon de logs.' },
        { name: `${prefix}status <type> <texte>`, value: '🤖 - Change le status du bot.' },
        { name: `${prefix}setpresence <online|dnd|idle|invisible>`, value: '🤖 -Change le statut de présence.' },
        { name: `${prefix}setpp <url>`, value: '✅ - Change l\'image de profil du bot.' },
        { name: `${prefix}setbanner <url>`, value: '✅ - Change la banniere du bot.' },
        { name: `${prefix}footer <texte>`, value: '✅ - Modifie le footers de tout les embeds' },
        { name: `${prefix}ping`, value: '🛠️ - Affiche le ping du bot ' },
        { name: `${prefix}restart `, value: '🔄 - Relance le bot ' },
      )
      .setFooter({ text: globalFooter })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }
  if (cmd === "prefix") {
    if (!args[0]) return message.reply(`🛠️ Préfixe actuel : \`${prefix}\``);
    prefixData.prefix = args[0];
    saveAll();
    return message.reply(`✅ Nouveau préfixe : \`${args[0]}\``);
  }

  if (cmd === "panel") {
    const role = message.guild.roles.cache.get(config.roleId);
    const embed = new EmbedBuilder()
      .setTitle("🔐 Auto Rank")
      .setColor(0x5865f2)
      .setDescription(`👤 Seul **${message.author.tag}** peut modifier ce panneau`)
      .addFields(
        { name: "Tag", value: config.keyword || "*Aucun*" },
        { name: "Rôle", value: role ? role.name : "*Aucun*" }
      )
      .setFooter({ text: globalFooter });

    const options = message.guild.roles.cache
      .filter(r => r.name !== "@everyone" && r.editable)
      .map(r => ({ label: r.name, value: r.id }));

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("modifier_motcle")
        .setLabel("✏️ Modifier le Tag")
        .setStyle(ButtonStyle.Primary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("choix_role")
        .setPlaceholder("Choisir un rôle")
        .addOptions(options)
    );

    const sent = await message.channel.send({ embeds: [embed], components: [row2, row1] });
    panelData = { messageId: sent.id, channelId: message.channel.id };
    saveAll();
  }

  if (cmd === "owner") {
    const user = message.mentions.users.first();
    if (!user) return message.reply("❌ Mentionne un utilisateur.");
    if (!ownersData.owners.includes(user.id)) {
      ownersData.owners.push(user.id);
      saveAll();
    }
    return message.reply(`✅ ${user.tag} est maintenant owner.`);
  }

  if (cmd === "unowner") {
    const user = message.mentions.users.first();
    if (!user) return message.reply("❌ Mentionne un utilisateur.");
    ownersData.owners = ownersData.owners.filter(id => id !== user.id);
    saveAll();
    return message.reply(`✅ ${user.tag} n'est plus owner.`);
  }

  if (cmd === "logs") {
    const channel = message.mentions.channels.first();
    if (!channel) return message.reply("❌ Mentionne un salon valide.");
    config.logChannelId = channel.id;
    saveAll();
    return message.reply(`✅ Salon de logs défini sur ${channel}`);
  }

  if (cmd === "owners") {
    const embed = new EmbedBuilder().setTitle("👑 Liste des Owners").setColor(0x5865f2);
    let desc = ownersData.owners.map(id => `<@${id}> (\`${id}\`)`).join("\n");
    desc += "\n\n👤 **Buyers (non modifiables)**\n" + buyersData.buyers.map(id => `<@${id}> (\`${id}\`)`).join("\n");
    embed.setDescription(desc);
    embed.setFooter({ text: globalFooter })
    return message.reply({ embeds: [embed] });
  }

  if (cmd === "restart") {
    await message.reply("🔄 Redémarrage du bot en cours...");
    saveAll(); // sauvegarde les fichiers avant de quitter
    process.exit(); // quitte le processus (le host doit redémarrer le bot)
  }

  if (cmd === "clear"){ 
    const amount = parseInt(args[0]); 
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply("❌ Utillisation correcte : '*clear <nombre> entre 1 et 100");
    } 
    try {
      await message.channel.bulkDelete(amount, true)
      message.channel.send(`🧹 ${amount} message(s) supprimé(s).`)
      .then(msg=> setTimeout(() => msg.delete(), 5000)); 
    } catch (err) { 
      console.error(err); 
      message.reply("❌Impossible de supprimer les messages.Ils doivent dater de moins de plus de 14 jours")
    }
  }

  if (cmd === "ping") {
    const sent = await message.channel.send("🏓 Ping en cours...");
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);
    sent.edit(`🏓 Pong ! Latence : ${latency}ms | Latence API : ${apiLatency}ms`);
  }

  if (cmd === "status"){ 
    const typeStr = args.shift().toLowerCase();
    if (!(typeStr in typeMap)) return message.reply("❌ Type invalide. Choisis parmi: playing, streaming, listening, watching, competing");

    const statusText = args.join(" ");
    if (!statusText) return message.reply("❌ Tu dois indiquer le texte du status.");

    try {
      await client.user.setActivity(statusText, { type: typeMap[typeStr] });
      config.activity = { text: statusText, type: typeStr };
      saveAll();
      return message.reply(`✅ Status mis à jour : ${typeStr} ${statusText}`);
    } catch (err) {
      console.error(err);
      return message.reply("❌ Impossible de modifier le status.");
    }
  }

  if (cmd === "setpresence") {
    if (args.length !== 1) return message.reply("❌ Usage: *setpresence <online|dnd|idle|invisible>");
    const validStatuses = ["online", "dnd", "idle", "invisible"];
    const status = args[0].toLowerCase();
    if (!validStatuses.includes(status)) return message.reply("❌ Statut invalide. Choisis parmi: online, dnd, idle, invisible");

    try {
      await client.user.setPresence({ status });
      config.presence = status;
      saveAll();
      return message.reply(`✅ Statut de présence mis à jour : ${status}`);
    } catch (err) {
      console.error(err);
      return message.reply("❌ Impossible de modifier la présence.");
    }
  }

  // Commande pour changer la photo de profil
  if (cmd === "setpp") {
    if (args.length !== 1) return message.reply("❌ Usage: *setpp <url_image>");
    const url = args[0];
    try {
      await client.user.setAvatar(url);
      return message.reply("✅ Photo de profil mise à jour.");
    } catch {
      return message.reply("❌ Impossible de modifier la photo de profil.");
    }
  }

  // Commande pour changer la bannière (uniquement pour les bots avec accès à cette fonctionnalité)
  if (cmd === "setbanner") {
    if (args.length !== 1) return message.reply("❌ Usage: *setbanner <url_image>");
    const url = args[0];
    try {
      await client.user.setBanner(url);
      return message.reply("✅ Bannière mise à jour.");
    } catch {
      return message.reply("❌ Impossible de modifier la bannière.");
    }
  }

  if (cmd === "footer") {
    const text = args.join(" ");
    if (!text) return message.reply("❌ Tu dois indiquer un texte pour le footer.");
    globalFooter = text;
    return message.reply(`✅ Footer mis à jour : ${text}`);
  }
});

// Événements interactionCreate fusionnés (boutons, menus et modals)
client.on("interactionCreate", async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === "modifier_motcle") {
      const modal = new ModalBuilder()
        .setCustomId("set_keyword")
        .setTitle("Changer le Tag")
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("new_keyword")
              .setLabel("Entrez le nouveau Tag")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
      return interaction.showModal(modal);
    }
  } else if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "choix_role") {
      const roleId = interaction.values[0];
      config.roleId = roleId;
      saveAll();
      await updatePanel(interaction.guild);
      return interaction.reply({ content: `✅ Rôle mis à jour.`, ephemeral: true });
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId === "set_keyword") {
      config.keyword = interaction.fields.getTextInputValue("new_keyword");
      saveAll();
      await updatePanel(interaction.guild);
      return interaction.reply({ content: `✅ Tag mis à jour.`, ephemeral: true });
    }
  }
});

// Login du bot
client.login(process.env.TOKEN);
