import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    try{
      const completion = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: role, content: message }],
      })

      return {
        message: completion.data.choices[0].message,
        finishReason: completion.data.choices[0].finish_reason,
        usage: completion.data.usage,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
