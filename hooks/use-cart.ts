import React from 'react';

import {
  DeliveryMethod,
  addCartItem,
  clearCart,
  getCartSummary,
  removeCartItem,
  updateCartItemQuantity,
} from '@/services/shop-api';
import { useCartCount } from '@/contexts/cart-count-context';

import { useApiQuery } from './use-api-query';

export function useCart(couponCode?: string, deliveryMethod?: DeliveryMethod) {
  const cartQuery = useApiQuery(
    () => getCartSummary(couponCode, deliveryMethod),
    `${couponCode ?? 'sem-cupom'}-${deliveryMethod ?? 'entrega-padrao'}`
  );
  const { refreshCount } = useCartCount();

  const increment = React.useCallback(
    async (itemId: string, quantity: number) => {
      await updateCartItemQuantity(itemId, quantity + 1);
      await cartQuery.refetch();
      await refreshCount();
    },
    [cartQuery, refreshCount]
  );

  const decrement = React.useCallback(
    async (itemId: string, quantity: number) => {
      await updateCartItemQuantity(itemId, Math.max(1, quantity - 1));
      await cartQuery.refetch();
      await refreshCount();
    },
    [cartQuery, refreshCount]
  );

  const remove = React.useCallback(
    async (itemId: string) => {
      await removeCartItem(itemId);
      await cartQuery.refetch();
      await refreshCount();
    },
    [cartQuery, refreshCount]
  );

  const clear = React.useCallback(async () => {
    await clearCart();
    await cartQuery.refetch();
    await refreshCount();
  }, [cartQuery, refreshCount]);

  const add = React.useCallback(
    async (productId: string, quantity = 1) => {
      await addCartItem(productId, quantity);
      await cartQuery.refetch();
      await refreshCount();
    },
    [cartQuery, refreshCount]
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
