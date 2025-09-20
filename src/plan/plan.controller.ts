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
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
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

@ApiTags('plans')
@ApiBearerAuth('JWT-auth')
@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @UseGuards(AuthGuard, RoleGuard([USER_ROLES.ADMIN]))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new plan' })
  @ApiResponse({ status: 201, description: 'Plan successfully created' })
  async createPlan(@Body() createPlanDto: CreatePlanDto) {
    const plan = await this.planService.create(createPlanDto);
    return {
      success: true,
      data: plan,
      message: 'Plan created successfully',
    };
  }

  @UseGuards(AuthGuard, RoleGuard(ALL_ROLES))
  @Get()
  @ApiOperation({ summary: 'Find all plans' })
  @ApiResponse({ status: 200, description: 'Returns all plans' })
  async findAllPlans() {
    const plans = await this.planService.findAll();
    return {
      success: true,
      data: plans,
      count: plans.length,
    };
  }

  @UseGuards(AuthGuard, RoleGuard(ALL_ROLES))
  @Get(':id')
  @ApiOperation({ summary: 'Find plan by ID' })
  @ApiResponse({ status: 200, description: 'Returns a plan by ID' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  async findPlanById(@Param('id') id: string) {
    const plan = await this.planService.findOne(id);
    return {
      success: true,
      data: plan,
    };
  }

  @UseGuards(AuthGuard, RoleGuard([USER_ROLES.ADMIN]))
  @Patch(':id')
  @ApiOperation({ summary: 'Update plan' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  async updatePlan(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    const plan = await this.planService.update(id, updatePlanDto);
    return {
      success: true,
      data: plan,
      message: 'Plan updated successfully',
    };
  }

  @UseGuards(AuthGuard, RoleGuard([USER_ROLES.ADMIN]))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete plan' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  async deletePlan(@Param('id') id: string) {
    await this.planService.remove(id);
    return {
      success: true,
      message: 'Plan deleted successfully',
    };
  }
}
