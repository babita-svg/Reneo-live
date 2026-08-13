import { CartItem, Product } from '../types';

export function calculateCartTotals(items: CartItem[]): { totalItems: number; totalAmount: number } {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  return { totalItems, totalAmount };
}

export function addItemToCart(items: CartItem[], product: Product, quantityToAdd = 1): CartItem[] {
  if (product.stock <= 0) return items;

  const existing = items.find((item) => item.product.id === product.id);
  const currentQty = existing ? existing.quantity : 0;
  const maxAvailable = product.stock;
  const newQty = Math.min(currentQty + quantityToAdd, maxAvailable);

  if (existing) {
    return items.map((item) =>
      item.product.id === product.id ? { ...item, quantity: newQty } : item
    );
  }

  return [...items, { product, quantity: newQty }];
}

export function updateItemQuantityInCart(items: CartItem[], productId: string, targetQuantity: number): CartItem[] {
  if (targetQuantity <= 0) {
    return items.filter((item) => item.product.id !== productId);
  }

  return items.map((item) => {
    if (item.product.id === productId) {
      const maxAvailable = item.product.stock;
      const clampedQty = Math.min(targetQuantity, maxAvailable);
      return { ...item, quantity: clampedQty };
    }
    return item;
  });
}
