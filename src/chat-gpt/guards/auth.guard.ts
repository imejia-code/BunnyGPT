import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import axios from 'axios';

@Injectable()
export class chatGPTGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const openIAKey = this.extractTokenFromHeader(request);

    if (!openIAKey) {
      throw new UnauthorizedException();
    }

    try {
      await axios.get(' https://api.openai.com/v1/models', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openIAKey}`,
        },
      });
      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
