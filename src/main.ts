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
} from '@discordjs/core';

import axios from 'axios';

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
    console.log(`${username} is ready! with id ${id}`);
    BunnyGPT.updatePresence(0, {
      activities: [{ name: 'GPT-3', type: 3 }],
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
          });
          return;
        }
        const messageContent = messageArray.slice(1).join(' ');
        channelsAPI.showTyping(channel_id);
        const { data } = await axios.post(
          'http://127.0.0.1:3001/chatGpt/chatResponse',
          {
            content: messageContent,
            role: 'user',
          },
        );
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
        console.log(logData);
        channelsAPI.createMessage(channel_id, {
          content: responseMessage.content,
        });
      }
    },
  );

  gateway.connect();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
