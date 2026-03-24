import { Controller, Get, Query, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '../generated/prisma/client';
import { Roles } from '../auth/decorators';
import { UsersService } from './users.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile with recent orders' })
  @ApiResponse({ status: 200, description: 'User profile' })
  getProfile(@Req() req) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'List all users (Admin only, paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated list of all users' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query.page, query.limit);
  }
}
