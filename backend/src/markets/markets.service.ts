import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Market } from './entities/market.entity';
import { UsersService } from '../users/users.service';
import {
  ListMarketsDto,
  MarketStatus,
  PaginatedMarketsResponse,
} from './dto/list-markets.dto';

@Injectable()
export class MarketsService {
  constructor(
    @InjectRepository(Market)
    private readonly marketsRepository: Repository<Market>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * List markets with pagination, filtering, and keyword search.
   */
  async findAllFiltered(
    dto: ListMarketsDto,
  ): Promise<PaginatedMarketsResponse> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 20, 50);
    const skip = (page - 1) * limit;

    const qb = this.marketsRepository
      .createQueryBuilder('market')
      .leftJoinAndSelect('market.creator', 'creator');

    // Category filter
    if (dto.category) {
      qb.andWhere('market.category = :category', { category: dto.category });
    }

    // Status filter
    if (dto.status) {
      switch (dto.status) {
        case MarketStatus.Open:
          qb.andWhere(
            'market.is_resolved = false AND market.is_cancelled = false',
          );
          break;
        case MarketStatus.Resolved:
          qb.andWhere('market.is_resolved = true');
          break;
        case MarketStatus.Cancelled:
          qb.andWhere('market.is_cancelled = true');
          break;
      }
    }

    // Public/private filter
    if (dto.is_public !== undefined) {
      qb.andWhere('market.is_public = :is_public', {
        is_public: dto.is_public,
      });
    }

    // Keyword search (case-insensitive)
    if (dto.search) {
      qb.andWhere('market.title ILIKE :search', {
        search: `%${dto.search}%`,
      });
    }

    qb.orderBy('market.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findAll(): Promise<Market[]> {
    return this.marketsRepository.find({
      relations: ['creator'],
    });
  }

  async findById(id: string): Promise<Market | null> {
    return this.marketsRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
  }
}
