import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ChatGptService } from '../services/chat-gpt.service';
import { ChatCompletionRequestMessage } from 'openai';
import { chatGPTGuard } from '../guards/auth.guard';

@UseGuards(chatGPTGuard)
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
