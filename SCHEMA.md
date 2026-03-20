# Database Schema

## Relationships

- `User 1 -> 1 Cart`
- `User 1 -> many Orders`
- `Category 1 -> many Products`
- `Cart 1 -> many CartItems`
- `Product 1 -> many CartItems`
- `Order 1 -> many OrderItems`
- `Product 1 -> many OrderItems`

## Notes

- Each user has at most one active cart because `carts.userId` is unique.
- `cart_items` uses a composite unique key on `("cartId", "productId")` so a cart cannot hold duplicate rows for the same product.
- `order_items` stores `productNameSnapshot` and `productPriceSnapshot` so historical orders remain correct even if catalog data changes later.
- `products.deletedAt` is used for soft deletion. Soft-deleted products are hidden from catalog queries and blocked from new checkout attempts.
- Foreign keys with cascade delete are used where child rows should be removed with the parent, such as `Cart -> CartItems` and `Order -> OrderItems`.

## Overselling Prevention

- Checkout starts a single database transaction.
- The cart row is locked first with `SELECT ... FOR UPDATE`.
- Product rows are then locked in sorted `id` order with `SELECT ... FOR UPDATE`.
- Stock validation happens only after those locks are held.
- Stock decrement, order creation, and cart cleanup happen atomically in the same transaction.
- Any validation failure throws and the transaction rolls back, so no partial order can be created.
