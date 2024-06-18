import { ApiProperty } from '@nestjs/swagger';
import {
  ChatCompletionRequestMessageRoleEnum,
  ChatCompletionResponseMessage,
  CreateCompletionResponseUsage,
} from 'openai';

export class messageResponseDto {
  @ApiProperty({
    type: 'object',
    properties: {
      role: {
        type: 'string',
        enum: Object.values(ChatCompletionRequestMessageRoleEnum),
        description: 'El rol del asistente.',
        example: 'assistant',
      },
      content: {
        type: 'string',
        description: 'El contenido del mensaje generado por el asistente.',
        example: "Of course! I'd be happy to help. What specifically do you need assistance with?",
      },
    },
  })
  message: ChatCompletionResponseMessage;

  @ApiProperty({
    description: 'The reason the completion finished',
    example: 'length',
  })
  finishReason: string;

  @ApiProperty({
    description: 'The usage of the completion',
    example: {
      total_characters: 29,
      total_tokens: 7,
      total_examples: 1,
      last_character: 29,
      last_token: 7,
      last_example: 1,
    },
  })
  usage: CreateCompletionResponseUsage;
}

