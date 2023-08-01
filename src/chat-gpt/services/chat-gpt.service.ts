import { Injectable } from '@nestjs/common';
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from 'openai';
import { messageResponseDto } from '../dtos/messageResponse.dto';

@Injectable()
export class ChatGptService {
  private configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  private openai = new OpenAIApi(this.configuration);

  async chatResponse(
    message: string,
    role: ChatCompletionRequestMessageRoleEnum,
  ): Promise<messageResponseDto> {
    const completion = await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: role, content: message }],
      max_tokens: 500,
    });

    return {
      message: completion.data.choices[0].message,
      finishReason: completion.data.choices[0].finish_reason,
      usage: completion.data.usage,
    };
  }
}
