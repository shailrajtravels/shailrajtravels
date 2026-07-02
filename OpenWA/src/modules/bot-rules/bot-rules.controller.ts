import { Controller, Get, Put, Body, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { RequireRole } from '../auth/decorators/auth.decorators';
import { ApiKeyRole } from '../auth/entities/api-key.entity';

export interface ChatbotRule {
  keywords: string[];
  reply: string;
}

export interface ChatbotRulesDto {
  rules: ChatbotRule[];
}

@ApiTags('bot-rules')
@Controller('bot-rules')
export class BotRulesController {
  private getRulesPath(): string {
    let rulesPath = path.resolve(process.cwd(), 'chatbot-rules.json');
    if (!fs.existsSync(rulesPath)) {
      rulesPath = path.resolve(process.cwd(), '../chatbot-rules.json');
    }
    return rulesPath;
  }

  @Get()
  @ApiOperation({ summary: 'Get chatbot rules' })
  @ApiResponse({ status: 200, description: 'Current chatbot rules' })
  getRules(): ChatbotRulesDto {
    try {
      const rulesPath = this.getRulesPath();
      if (!fs.existsSync(rulesPath)) {
        return { rules: [] };
      }
      const content = fs.readFileSync(rulesPath, 'utf8');
      const data = JSON.parse(content);
      return data as ChatbotRulesDto;
    } catch (err) {
      throw new InternalServerErrorException('Failed to read chatbot rules');
    }
  }

  @Put()
  @RequireRole(ApiKeyRole.ADMIN)
  @ApiOperation({ summary: 'Update chatbot rules' })
  @ApiResponse({ status: 200, description: 'Rules updated successfully' })
  updateRules(@Body() dto: ChatbotRulesDto): { success: boolean } {
    try {
      let rulesPath = path.resolve(process.cwd(), 'chatbot-rules.json');
      if (!fs.existsSync(rulesPath)) {
        const fallback = path.resolve(process.cwd(), '../chatbot-rules.json');
        if (fs.existsSync(fallback)) {
          rulesPath = fallback;
        } else {
          // If neither exists, default to ../chatbot-rules.json to match user's root
          rulesPath = path.resolve(process.cwd(), '../chatbot-rules.json');
        }
      }
      fs.writeFileSync(rulesPath, JSON.stringify(dto, null, 2), 'utf8');
      return { success: true };
    } catch (err) {
      throw new InternalServerErrorException('Failed to write chatbot rules');
    }
  }
}
