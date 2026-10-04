// Channels where the bot responds: slash commands, factoids and reactions.
// /seen tracking and HEIC conversion still run everywhere.
const ALLOWED_CHANNEL_IDS = [
    '537669803884806146', // #general-gamers
    '564860078004633600', // #test
];

// Threads count as part of their parent channel
function isAllowedChannel(channelId, channel) {
    return ALLOWED_CHANNEL_IDS.includes(channelId) ||
        (channel?.isThread?.() === true && ALLOWED_CHANNEL_IDS.includes(channel.parentId));
}

module.exports = { ALLOWED_CHANNEL_IDS, isAllowedChannel };
