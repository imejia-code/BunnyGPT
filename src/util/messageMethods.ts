import { REST } from '@discordjs/rest';
import { Routes } from '@discordjs/core';

async function sendMessage(
  message: string,
  channel_id: string,
  rest: REST,
): Promise<unknown> {
  try {
    return await rest.post(Routes.channelMessages(channel_id), {
      body: {
        content: message,
      },
    });
  } catch (error) {
    return error;
  }
}

export { sendMessage };
