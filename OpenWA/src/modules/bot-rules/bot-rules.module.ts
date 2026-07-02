import { Module } from '@nestjs/common';
import { BotRulesController } from './bot-rules.controller';

@Module({
  controllers: [BotRulesController],
})
export class BotRulesModule {}
