export type ApiProduct = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  estoque: number;
  imagem: string;
};

export type ApiCoupon = {
  id: string;
  codigo: string;
  descricao: string;
  tipo: 'percentual' | 'valor';
  valor: number;
  ativo: boolean;
};

export type DeliveryMethod = 'regular' | 'expressa' | 'retirada';

export type PaymentMethod = 'cartao' | 'pix' | 'paypal' | 'dinheiro';

export type ApiCartItem = {
  id: string;
  produtoId: string;
  quantidade: number;
  produto: ApiProduct;
  total: number;
};

export type CartSummary = {
  itens: ApiCartItem[];
  subtotal: number;
  frete: number;
  desconto: number;
  total: number;
  cupomAplicado: ApiCoupon | null;
};

export type CheckoutAddress = {
  bairro: string;
  cidade: string;
  complemento: string;
  endereco: string;
  numero: string;
  uf: string;
};

export type ApiOrder = {
  id: string;
  criadoEm: string;
  endereco: CheckoutAddress;
  entrega: DeliveryMethod;
  formaPagamento: PaymentMethod;
  itens: ApiCartItem[];
  subtotal: number;
  frete: number;
  desconto: number;
  total: number;
  cupomAplicado: ApiCoupon | null;
  status: string;
};

export type ApiNotification = {
  id: string;
  criadaEm: string;
  lida: boolean;
  mensagem: string;
  pedidoId?: string;
  titulo: string;
};

export type PushTokenPayload = {
  plataforma: string;
  token: string;
};

export type FinishCartPayload = {
  cupom?: string;
  endereco: CheckoutAddress;
  entrega: DeliveryMethod;
  formaPagamento: PaymentMethod;
};

export type ProductFilters = {
  nome?: string;
  categoria?: string;
};

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Erro HTTP ${response.status}`;

    try {
      const error = (await response.json()) as { message?: string };
      message = error.message ?? message;
    } catch {
      // Keep the generic HTTP message when the API does not return JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

function buildQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value);
    }
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export function getProducts(filters: ProductFilters = {}) {
  return apiFetch<ApiProduct[]>(
    `/produto${buildQuery({
      categoria: filters.categoria,
      nome: filters.nome,
    })}`
  );
}

export function getProduct(productId: string) {
  return apiFetch<ApiProduct>(`/produto/${productId}`);
}

export function getCoupons() {
  return apiFetch<ApiCoupon[]>('/cupom');
}

export function createProduct(product: Omit<ApiProduct, 'id'>) {
  return apiFetch<ApiProduct>('/produto', {
    body: JSON.stringify(product),
    method: 'POST',
  });
}

export function updateProduct(productId: string, product: Omit<ApiProduct, 'id'>) {
  return apiFetch<ApiProduct>(`/produto/${productId}`, {
    body: JSON.stringify(product),
    method: 'PUT',
  });
}

export function deleteProduct(productId: string) {
  return apiFetch<ApiProduct>(`/produto/${productId}`, {
    method: 'DELETE',
  });
}

export function createCoupon(coupon: Omit<ApiCoupon, 'id'>) {
  return apiFetch<ApiCoupon>('/cupom', {
    body: JSON.stringify(coupon),
    method: 'POST',
  });
}

export function updateCoupon(couponId: string, coupon: Omit<ApiCoupon, 'id'>) {
  return apiFetch<ApiCoupon>(`/cupom/${couponId}`, {
    body: JSON.stringify(coupon),
    method: 'PUT',
  });
}

export function deleteCoupon(couponId: string) {
  return apiFetch<ApiCoupon>(`/cupom/${couponId}`, {
    method: 'DELETE',
  });
}

export function getCartSummary(couponCode?: string, deliveryMethod?: DeliveryMethod) {
  return apiFetch<CartSummary>(
    `/carrinho/resumo${buildQuery({ cupom: couponCode, entrega: deliveryMethod })}`
  );
}

export function addCartItem(productId: string, quantity = 1) {
  return apiFetch<ApiCartItem>('/carrinho', {
    body: JSON.stringify({ produtoId: productId, quantidade: quantity }),
    method: 'POST',
  });
}

export function updateCartItemQuantity(cartItemId: string, quantity: number) {
  return apiFetch<ApiCartItem>(`/carrinho/${cartItemId}`, {
    body: JSON.stringify({ quantidade: quantity }),
    method: 'PUT',
  });
}

export function removeCartItem(cartItemId: string) {
  return apiFetch<ApiCartItem>(`/carrinho/${cartItemId}`, {
    method: 'DELETE',
  });
}

export function clearCart() {
  return apiFetch<{ message: string }>('/carrinho', {
    method: 'DELETE',
  });
}

export function finishCart(payload: FinishCartPayload) {
  return apiFetch<{ message: string; pedido: ApiOrder }>('/carrinho/finalizar', {
    body: JSON.stringify(payload),
    method: 'POST',
  });
}

export function getOrders() {
  return apiFetch<ApiOrder[]>('/pedido?sortBy=id&order=desc');
}

export function getNotifications() {
  return apiFetch<ApiNotification[]>('/notificacao?sortBy=id&order=desc');
}

export function registerPushToken(payload: PushTokenPayload) {
  return apiFetch<PushTokenPayload & { id: string }>('/push-token', {
    body: JSON.stringify(payload),
    method: 'POST',
  });
}
