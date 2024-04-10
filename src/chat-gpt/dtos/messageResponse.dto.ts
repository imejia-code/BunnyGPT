import {
  ChatCompletionResponseMessage,
  CreateCompletionResponseUsage,
} from 'openai';

export class messageResponseDto {
  message: ChatCompletionResponseMessage;
  finishReason: string;
  usage: CreateCompletionResponseUsage;
}

