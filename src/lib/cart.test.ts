import { describe, expect, it } from 'vitest';
import { Product } from '../types';
import { addItemToCart, calculateCartTotals, updateItemQuantityInCart } from './cartHelpers';

const mockProductA: Product = {
  id: 'prod-101',
  seller_id: 'seller-1',
  title: 'Handcrafted Tote Bag',
  description: 'Canvas tote',
  price: 50,
  currency: 'USD',
  image_url: 'https://example.com/bag.jpg',
  stock: 3,
  status: 'active',
  created_at: new Date().toISOString(),
};

const mockProductB: Product = {
  id: 'prod-102',
  seller_id: 'seller-1',
  title: 'Raw Shea Butter',
  description: 'Organic butter',
  price: 20,
  currency: 'USD',
  image_url: 'https://example.com/butter.jpg',
  stock: 10,
  status: 'active',
  created_at: new Date().toISOString(),
};

describe('Cart Business Logic & Stock Boundary Tests', () => {
  it('correctly calculates total amount and total items in cart', () => {
    const items = [
      { product: mockProductA, quantity: 2 },
      { product: mockProductB, quantity: 1 },
    ];

    const { totalItems, totalAmount } = calculateCartTotals(items);

    expect(totalItems).toBe(3);
    expect(totalAmount).toBe(120); // (50 * 2) + (20 * 1)
  });

  it('respects stock boundaries when adding products to cart', () => {
    let items = addItemToCart([], mockProductA, 2);
    expect(items[0].quantity).toBe(2);

    // Try adding 5 more items when stock is only 3
    items = addItemToCart(items, mockProductA, 5);
    expect(items[0].quantity).toBe(3); // Clamped at max available stock = 3
  });

  it('prevents adding zero-stock / sold-out products to cart', () => {
    const soldOutProduct: Product = { ...mockProductA, id: 'prod-out', stock: 0 };
    const items = addItemToCart([], soldOutProduct, 1);
    expect(items.length).toBe(0);
  });

  it('clamps item quantity during direct update if target exceeds stock', () => {
    const items = [{ product: mockProductA, quantity: 1 }];
    const updated = updateItemQuantityInCart(items, 'prod-101', 10);
    expect(updated[0].quantity).toBe(3); // Clamped to stock = 3
  });

  it('removes item from cart when quantity is set to 0 or negative', () => {
    const items = [{ product: mockProductA, quantity: 2 }];
    const updated = updateItemQuantityInCart(items, 'prod-101', 0);
    expect(updated.length).toBe(0);
  });
});
