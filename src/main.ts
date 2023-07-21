import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { REST } from '@discordjs/rest';
import { WebSocketManager } from '@discordjs/ws';
import {
  GatewayDispatchEvents,
  GatewayIntentBits,
  Client,
  API,
  InteractionType,
  MessageFlags,
} from '@discordjs/core';
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

  const api = new API(rest);

  BunnyGPT.on(GatewayDispatchEvents.Ready, () => {
    console.log('BunnyGPT is ready!');
  });

  BunnyGPT.on(
    GatewayDispatchEvents.InteractionCreate,
    async ({ data: interaction, api }) => {
      if (
        interaction.type !== InteractionType.ApplicationCommand ||
        interaction.data.name !== 'ping'
      ) {
        return;
      }
      await api.interactions.reply(interaction.id, interaction.token, {
        content: 'Pong!',
        flags: MessageFlags.Ephemeral,
      });
    },
  );

  const commands = [
    {
      name: 'ping',
      description: 'Replies with Pong!',
    },
  ];

  api.applicationCommands
    .bulkOverwriteGlobalCommands(process.env.DISCORD_CLIENT_ID, commands)
    .then(console.log)
    .catch(console.error);

  // Start the WebSocket connection.
  gateway.connect();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
