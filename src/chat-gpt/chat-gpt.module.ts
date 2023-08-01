import { Module } from '@nestjs/common';
import { ChatGptService } from './services/chat-gpt.service';
import { ChatGptController } from './controllers/chat-gpt.controller';

@Module({
  providers: [ChatGptService],
  controllers: [ChatGptController],
})
export class ChatGptModule {}
