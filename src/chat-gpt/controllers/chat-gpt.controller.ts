import { Body, Controller, Post } from '@nestjs/common';
import { ChatGptService } from '../services/chat-gpt.service';
import { ChatCompletionRequestMessage } from 'openai';

@Controller('chatGpt')
export class ChatGptController {
  constructor(private chatGptService: ChatGptService) {}

  @Post('chatResponse')
  async chatResponse(
    @Body() chatCompletionRequestMessage: ChatCompletionRequestMessage,
  ) {
    const { content, role } = chatCompletionRequestMessage;
    return this.chatGptService.chatResponse(content, role);
  }
}
