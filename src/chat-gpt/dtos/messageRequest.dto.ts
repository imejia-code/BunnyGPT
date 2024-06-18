import { IsString, IsOptional, IsEnum, ValidateNested, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';

class ChatCompletionRequestDto {
  @ApiProperty({
    enum: ChatCompletionRequestMessageRoleEnum,
    description: 'The role of the messages author.',
    example: 'user',
  })
  @IsNotEmpty()
  @IsEnum(ChatCompletionRequestMessageRoleEnum)
  role: ChatCompletionRequestMessageRoleEnum;

  @ApiProperty({
    description: 'The contents of the message.',
    example: 'Hello, can you help me with my homework?',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export { ChatCompletionRequestDto, ChatCompletionRequestMessageRoleEnum };