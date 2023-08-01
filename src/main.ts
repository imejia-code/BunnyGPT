import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { REST } from '@discordjs/rest';
import { WebSocketManager } from '@discordjs/ws';
import {
  GatewayDispatchEvents,
  GatewayIntentBits,
  Client,
} from '@discordjs/core';

import { sendMessage } from './util/messageMethods';

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

  const BunnyGPT = new Client({ rest, gateway });

  // const api = new API(rest);
  const meRest: any = await rest.get('/users/@me');
  const { id } = meRest;

  BunnyGPT.on(GatewayDispatchEvents.Ready, () => {
    console.log('BunnyGPT is ready!');
  });

  BunnyGPT.on(
    GatewayDispatchEvents.MessageCreate,
    async ({ data: message }) => {
      const messageArray = message.content.split(' ');
      if (messageArray[0] === `<@${id}>`) {
        const { channel_id } = message;
        if (messageArray.length <= 1) {
          await sendMessage(
            'Hola, soy BunnyGPT. Puedes preguntarme lo que quieras!',
            channel_id,
            rest,
          );
        }
      }
    },
  );

  gateway.connect();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
