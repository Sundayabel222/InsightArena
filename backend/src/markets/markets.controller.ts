import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarketsService } from './markets.service';
import { Market } from './entities/market.entity';
import {
  ListMarketsDto,
  PaginatedMarketsResponse,
} from './dto/list-markets.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Markets')
@Controller('markets')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List and filter markets with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated markets list',
  })
  async listMarkets(
    @Query() query: ListMarketsDto,
  ): Promise<PaginatedMarketsResponse> {
    return this.marketsService.findAllFiltered(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Fetch market by ID' })
  @ApiResponse({
    status: 200,
    description: 'Market retrieved successfully',
    type: Market,
  })
  @ApiResponse({ status: 404, description: 'Market not found' })
  async getMarketById(@Param('id') id: string): Promise<Market | null> {
    return this.marketsService.findById(id);
  }
}
