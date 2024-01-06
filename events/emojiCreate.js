const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildEmojiCreate,
    async execute(emoji) {
        return emoji.client.channels.cache.get('537669803884806146').send(`:${emoji.name}: emoji added ${emoji}`);
    }
}