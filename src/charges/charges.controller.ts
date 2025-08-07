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

@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCharge(@Body() createChargeDto: CreateChargeDto) {
    const charge = await this.chargesService.createCharge(createChargeDto);
    
    return {
      success: true,
      data: charge,
      message: 'Charge created successfully',
    };
  }

  @Get()
  async findCharges(
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('subscriptionId') subscriptionId?: string,
  ) {
    const filters = { status, customerId, subscriptionId };
    
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );

    const charges = await this.chargesService.findCharges(cleanFilters);

    return {
      success: true,
      data: charges,
      count: charges.length,
    };
  }

  @Get(':id')
  async findChargeById(@Param('id') id: string) {
    const charge = await this.chargesService.findChargeById(id);

    return {
      success: true,
      data: charge,
    };
  }

  @Patch(':id')
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