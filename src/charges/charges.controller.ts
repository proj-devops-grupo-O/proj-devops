import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ChargesService } from './charges.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('charges')
@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new charge' })
  @ApiResponse({ status: 201, description: 'Charge successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async createCharge(@Body() createChargeDto: CreateChargeDto) {
    const charge = await this.chargesService.createCharge(createChargeDto);

    return {
      success: true,
      data: charge,
      message: 'Charge created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Find all charges' })
  @ApiResponse({ status: 200, description: 'Returns all charges' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filter by customer ID',
  })
  @ApiQuery({
    name: 'subscriptionId',
    required: false,
    description: 'Filter by subscription ID',
  })
  async findCharges(
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('subscriptionId') subscriptionId?: string,
  ) {
    const filters = { status, customerId, subscriptionId };

    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined),
    );

    const charges = await this.chargesService.findCharges(cleanFilters);

    return {
      success: true,
      data: charges,
      count: charges.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find charge by ID' })
  @ApiResponse({ status: 200, description: 'Returns a charge by ID' })
  @ApiResponse({ status: 404, description: 'Charge not found' })
  @ApiParam({ name: 'id', description: 'Charge ID' })
  async findChargeById(@Param('id') id: string) {
    const charge = await this.chargesService.findChargeById(id);

    return {
      success: true,
      data: charge,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update charge' })
  @ApiResponse({ status: 200, description: 'Charge updated successfully' })
  @ApiResponse({ status: 404, description: 'Charge not found' })
  @ApiParam({ name: 'id', description: 'Charge ID' })
  async updateCharge(
    @Param('id') id: string,
    @Body() updateChargeDto: UpdateChargeDto,
  ) {
    const charge = await this.chargesService.updateCharge(id, updateChargeDto);

    return {
      success: true,
      data: charge,
      message: 'Charge updated successfully',
    };
  }
}
