import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderCreationFailedResponseDto } from './dto/order-creation-failed-response.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create an order from a user cart' })
  @ApiCreatedResponse({ type: OrderResponseDto })
  @ApiBadRequestResponse({
    description: 'Cart is empty or one or more items cannot be fulfilled',
    type: OrderCreationFailedResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Cart not found' })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by id' })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancel an order and restore stock' })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiBadRequestResponse({ description: 'Order is already cancelled' })
  @ApiNotFoundResponse({
    description: 'Order or one of its products could not be found',
  })
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }
}
