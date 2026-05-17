import React from 'react';

import { getCartSummary } from '@/services/shop-api';

type CartCountContextValue = {
  count: number;
  refreshCount: () => Promise<void>;
};

const CartCountContext = React.createContext<CartCountContextValue | null>(null);

export function CartCountProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = React.useState(0);

  const refreshCount = React.useCallback(async () => {
    try {
      const summary = await getCartSummary();
      const totalItems = summary.itens.reduce((total, item) => total + item.quantidade, 0);
      setCount(totalItems);
    } catch {
      setCount(0);
    }
  }, []);

  React.useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  const value = React.useMemo(
    () => ({
      count,
      refreshCount,
    }),
    [count, refreshCount]
  );

  return <CartCountContext.Provider value={value}>{children}</CartCountContext.Provider>;
}

export function useCartCount() {
  const context = React.useContext(CartCountContext);

  if (!context) {
    throw new Error('useCartCount must be used within CartCountProvider');
  }

  return context;
}
