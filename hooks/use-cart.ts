import React from 'react';

import {
  addCartItem,
  clearCart,
  getCartSummary,
  removeCartItem,
  updateCartItemQuantity,
} from '@/services/shop-api';

import { useApiQuery } from './use-api-query';

export function useCart(couponCode?: string) {
  const cartQuery = useApiQuery(() => getCartSummary(couponCode), couponCode ?? 'sem-cupom');

  const increment = React.useCallback(
    async (itemId: string, quantity: number) => {
      await updateCartItemQuantity(itemId, quantity + 1);
      await cartQuery.refetch();
    },
    [cartQuery]
  );

  const decrement = React.useCallback(
    async (itemId: string, quantity: number) => {
      await updateCartItemQuantity(itemId, Math.max(1, quantity - 1));
      await cartQuery.refetch();
    },
    [cartQuery]
  );

  const remove = React.useCallback(
    async (itemId: string) => {
      await removeCartItem(itemId);
      await cartQuery.refetch();
    },
    [cartQuery]
  );

  const clear = React.useCallback(async () => {
    await clearCart();
    await cartQuery.refetch();
  }, [cartQuery]);

  const add = React.useCallback(
    async (productId: string, quantity = 1) => {
      await addCartItem(productId, quantity);
      await cartQuery.refetch();
    },
    [cartQuery]
  );

  return {
    ...cartQuery,
    add,
    clear,
    decrement,
    increment,
    remove,
  };
}
