import { ChannelsAPI } from '@discordjs/core';

async function sliceMessageAndSend(
  message: string,
  channelsAPI: ChannelsAPI,
  channelId: string,
  messageId: string,
  guildId: string,
): Promise<void> {
  if (message.length <= 1998) {
    await channelsAPI.createMessage(channelId, {
      content: message,
      message_reference: {
        message_id: messageId,
        channel_id: channelId,
        guild_id: guildId,
      },
    });
    return;
  }
  channelsAPI.showTyping(channelId);
  const firstHalf = message.slice(0, 1998);
  const secondHalf = message.slice(1998);
  await channelsAPI.createMessage(channelId, {
    content: firstHalf,
    message_reference: {
      message_id: messageId,
      channel_id: channelId,
      guild_id: guildId,
    },
  });

  if (secondHalf.length > 0) {
    await sliceMessageAndSend(
      secondHalf,
      channelsAPI,
      channelId,
      messageId,
      guildId,
    );
  }
}

export { sliceMessageAndSend };
