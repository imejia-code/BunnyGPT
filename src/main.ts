import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { REST } from '@discordjs/rest';
import { WebSocketManager } from '@discordjs/ws';
import {
  GatewayDispatchEvents,
  GatewayIntentBits,
  Client,
  PresenceUpdateStatus,
  ChannelsAPI,
  UsersAPI,
  MessageFlags,
} from '@discordjs/core';

import axios from 'axios';
import { sliceMessageAndSend } from './chat-gpt/util/messageData';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const gateway = new WebSocketManager({
    token: process.env.DISCORD_TOKEN,
    intents:
      GatewayIntentBits.GuildMessages |
      GatewayIntentBits.MessageContent |
      GatewayIntentBits.GuildMembers |
      GatewayIntentBits.GuildMessageReactions,
    rest,
  });

  const channelsAPI = new ChannelsAPI(rest);
  const usersAPI = new UsersAPI(rest);

  const BunnyGPT = new Client({ rest, gateway });

  const { username, id } = await usersAPI.getCurrent();

  BunnyGPT.on(GatewayDispatchEvents.Ready, () => {
    console.info(`${username} is ready! with id ${id}`);
    BunnyGPT.updatePresence(0, {
      activities: [{ name: process.env.STATE, type: 3 }],
      since: 0,
      afk: false,
      status: PresenceUpdateStatus.Online,
    });
  });

  BunnyGPT.on(
    GatewayDispatchEvents.MessageCreate,
    async ({ data: message }) => {
      const messageArray = message.content.split(' ');
      if (messageArray[0] === `<@${id}>`) {
        const { channel_id } = message;
        if (messageArray.length <= 1) {
          channelsAPI.createMessage(channel_id, {
            content: 'Hola, soy BunnyGPT. Puedes preguntarme lo que quieras!',
            message_reference: {
              message_id: message.id,
              channel_id: message.channel_id,
              guild_id: message.guild_id,
            },
          });
          return;
        }
        const messageContent = messageArray.slice(1).join(' ');
        const patternName = new RegExp(
          'te llamas|tu nombre|es tu nombre\b',
          'i',
        );
        const patternOwner = new RegExp(
          'te creo|tu creador|te hizo|te programo\b',
          'i',
        );
        if (patternName.test(messageContent)) {
          channelsAPI.createMessage(channel_id, {
            content: 'Me llamo BunnyGPT, un gusto conocerte!',
            message_reference: {
              message_id: message.id,
              channel_id: message.channel_id,
              guild_id: message.guild_id,
            },
          });
          return;
        }
        if (patternOwner.test(messageContent)) {
          channelsAPI.createMessage(channel_id, {
            content:
              'Me creo un humano llamado @KaiserBlack, en conjunto con la ayuda de OpenIA API',
            message_reference: {
              message_id: message.id,
              channel_id: message.channel_id,
              guild_id: message.guild_id,
            },
          });
          return;
        }
        channelsAPI.showTyping(channel_id);
        try {
          const { data } = await axios.post(
            `${process.env.LOCAL_URL}/chatGpt/chatResponse`,
            {
              content: messageContent,
              role: 'user',
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              },
            },
          )
          const { message: responseMessage, usage, finishReason } = data;
          const logData = `[${new Date(message.timestamp)}]: ,
          User: 
          ${JSON.stringify(message.author)}
          \nPrompt: 
          ${messageContent}
          \nusage: 
          ${JSON.stringify(usage)}
          \nfinish_reason: 
          ${finishReason}`;
          // console.log(logData);
          sliceMessageAndSend(
            responseMessage.content,
            channelsAPI,
            channel_id,
            message.id,
            message.guild_id,
          );
        } catch (error) {
          console.error(error);
          channelsAPI.createMessage(channel_id, {
            embeds: [
              {
                title: `Error ${error.message}`,
                description:
                  'Something went wrong, please try again later or contact the developer.',
                color: 0xff0000,
              },
            ],
            flags: MessageFlags.Urgent,
            message_reference: {
              message_id: message.id,
              channel_id: message.channel_id,
              guild_id: message.guild_id,
            },
          });
        }
      }
    },
  );

  gateway.connect();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
