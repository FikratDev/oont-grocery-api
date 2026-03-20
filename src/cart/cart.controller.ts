import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AddItemDto } from './dto/add-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CartService } from './cart.service';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get a user cart with expanded product details' })
  @ApiOkResponse({ type: CartResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  getCart(@Param('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post(':userId/items')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Add an item to the cart and return the updated cart',
  })
  @ApiOkResponse({ type: CartResponseDto })
  @ApiNotFoundResponse({ description: 'User or product not found' })
  addItem(@Param('userId') userId: string, @Body() dto: AddItemDto) {
    return this.cartService.addItem(userId, dto.productId, dto.quantity);
  }

  @Put(':userId/items/:productId')
  @ApiOperation({
    summary: 'Update an item quantity and return the updated cart',
  })
  @ApiOkResponse({ type: CartResponseDto })
  @ApiNotFoundResponse({ description: 'Cart or cart item not found' })
  updateItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.cartService.updateItem(userId, productId, dto.quantity);
  }

  @Delete(':userId/items/:productId')
  @ApiOperation({ summary: 'Remove an item and return the updated cart' })
  @ApiOkResponse({ type: CartResponseDto })
  @ApiNotFoundResponse({ description: 'Cart or cart item not found' })
  removeItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(userId, productId);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Clear all cart items and return the updated cart' })
  @ApiOkResponse({ type: CartResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  clearCart(@Param('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
