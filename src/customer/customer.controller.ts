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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';
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

@ApiTags('customers')
@ApiBearerAuth('JWT-auth')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @UseGuards(AuthGuard, RoleGuard([USER_ROLES.ADMIN]))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new customer' })
  @ApiResponse({ status: 201, description: 'Customer successfully created' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    const customer = await this.customerService.create(createCustomerDto);
    return {
      success: true,
      data: customer,
      message: 'Customer created successfully',
    };
  }

  @UseGuards(AuthGuard, RoleGuard(ALL_ROLES))
  @Get()
  @ApiOperation({ summary: 'Find all customers' })
  @ApiResponse({ status: 200, description: 'Returns all customers' })
  async findAllCustomers() {
    const customers = await this.customerService.findAll();
    return {
      success: true,
      data: customers,
      count: customers.length,
    };
  }

  @UseGuards(AuthGuard, RoleGuard(ALL_ROLES))
  @Get(':id')
  @ApiOperation({ summary: 'Find customer by ID' })
  @ApiResponse({ status: 200, description: 'Returns a customer by ID' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  async findCustomerById(@Param('id') id: string) {
    const customer = await this.customerService.findOne(id);
    return {
      success: true,
      data: customer,
    };
  }

  @UseGuards(AuthGuard, RoleGuard([USER_ROLES.ADMIN]))
  @Patch(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  async updateCustomer(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    const customer = await this.customerService.update(id, updateCustomerDto);
    return {
      success: true,
      data: customer,
      message: 'Customer updated successfully',
    };
  }

  @UseGuards(AuthGuard, RoleGuard([USER_ROLES.ADMIN]))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  async deleteCustomer(@Param('id') id: string) {
    await this.customerService.remove(id);
    return {
      success: true,
      message: 'Customer deleted successfully',
    };
  }
}
