import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ChatGptService } from '../services/chat-gpt.service';
import { chatGPTGuard } from '../guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ChatCompletionRequestDto } from '../dtos/messageRequest.dto';
import { messageResponseDto } from '../dtos/messageResponse.dto';

@UseGuards(chatGPTGuard)
@ApiBearerAuth('chatGpt auth')
@ApiTags('chatGpt')
@Controller('chatGpt')
export class ChatGptController {
  constructor(private chatGptService: ChatGptService) {}

  @Post('chatResponse')
  @ApiOperation({ summary: 'Chat with the bot' })
  @ApiBody({ 
    type: ChatCompletionRequestDto,
    description: 'The content and role of the message to be sent to the bot',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'The response from the bot', type: messageResponseDto})
  async chatResponse(
    @Body() chatCompletionRequestMessage: ChatCompletionRequestDto,
  ) {
    const { content, role } = chatCompletionRequestMessage;
    return this.chatGptService.chatResponse(content, role);
  }
}
