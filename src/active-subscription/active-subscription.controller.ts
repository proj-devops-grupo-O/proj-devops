import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ActiveSubscriptionService } from './active-subscription.service';
import { CreateActiveSubscriptionDto } from './dtos/create-active-subscription.dto';
import { UpdateActiveSubscriptionDto } from './dtos/update-active-subscription.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@/auth/auth.guard';
import { RoleGuard } from '@/auth/role.guard';
import { ALL_ROLES, USER_ROLES } from '@/enums/userRoles.enum';

@ApiTags('active subscriptions')
@ApiBearerAuth('JWT-auth')
@Controller('active-subscriptions')
export class ActiveSubscriptionController {
  constructor(
    private readonly activeSubscriptionService: ActiveSubscriptionService,
  ) {}

  @UseGuards(AuthGuard, RoleGuard([USER_ROLES.ADMIN]))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new active subscription' })
  @ApiResponse({
    status: 201,
    description: 'Active subscription successfully created',
  })
  async create(@Body() dto: CreateActiveSubscriptionDto) {
    const subscription = await this.activeSubscriptionService.create(dto);
    return {
      success: true,
      data: subscription,
      message: 'Active subscription created successfully',
    };
  }

  @UseGuards(AuthGuard, RoleGuard(ALL_ROLES))
  @Get()
  @ApiOperation({ summary: 'Find all active subscriptions' })
  @ApiResponse({ status: 200, description: 'Returns all active subscriptions' })
  async findAll() {
    const subscriptions = await this.activeSubscriptionService.findAll();
    return {
      success: true,
      data: subscriptions,
      count: subscriptions.length,
    };
  }

  @UseGuards(AuthGuard, RoleGuard(ALL_ROLES))
  @Get(':id')
  @ApiOperation({ summary: 'Find active subscription by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns an active subscription by ID',
  })
  @ApiResponse({ status: 404, description: 'Active subscription not found' })
  @ApiParam({ name: 'id', description: 'Active Subscription ID' })
  async findOne(@Param('id') id: string) {
    const subscription = await this.activeSubscriptionService.findOne(id);
    return {
      success: true,
      data: subscription,
    };
  }

  @UseGuards(AuthGuard, RoleGuard([USER_ROLES.ADMIN]))
  @Patch(':id')
  @ApiOperation({ summary: 'Update active subscription' })
  @ApiResponse({
    status: 200,
    description: 'Active subscription updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Active subscription not found' })
  @ApiParam({ name: 'id', description: 'Active Subscription ID' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateActiveSubscriptionDto,
  ) {
    const subscription = await this.activeSubscriptionService.update(id, dto);
    return {
      success: true,
      data: subscription,
      message: 'Active subscription updated successfully',
    };
  }

  @UseGuards(AuthGuard, RoleGuard([USER_ROLES.ADMIN]))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete active subscription' })
  @ApiResponse({
    status: 200,
    description: 'Active subscription deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Active subscription not found' })
  @ApiParam({ name: 'id', description: 'Active Subscription ID' })
  async remove(@Param('id') id: string) {
    await this.activeSubscriptionService.remove(id);
    return {
      success: true,
      message: 'Active subscription deleted successfully',
    };
  }
}
