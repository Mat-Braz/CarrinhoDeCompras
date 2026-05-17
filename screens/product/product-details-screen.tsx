import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  HeaderBar,
  PrimaryButton,
  ProductVisual,
  Screen,
  palette,
} from '@/components/shop/shop-ui';
import { useFavorites } from '@/contexts/favorites-context';
import { useApiQuery } from '@/hooks/use-api-query';
import { useCart } from '@/hooks/use-cart';
import { getProduct, getProducts } from '@/services/shop-api';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = id ?? '';
  const { data: product, error, loading } = useApiQuery(() => getProduct(productId), productId);
  const { data: products } = useApiQuery(() => getProducts(), 'details-products');
  const { add } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [cartMessage, setCartMessage] = React.useState('');
  const messageTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const favorite = product ? isFavorite(product.id) : false;

  React.useEffect(() => {
    return () => {
      if (messageTimeout.current) {
        clearTimeout(messageTimeout.current);
      }
    };
  }, []);

  const handleAddToCart = React.useCallback(
    async (productId: string) => {
      try {
        await add(productId);
        setCartMessage('Produto adicionado ao carrinho');

        if (messageTimeout.current) {
          clearTimeout(messageTimeout.current);
        }

        messageTimeout.current = setTimeout(() => {
          setCartMessage('');
        }, 2600);
      } catch {
        setCartMessage('Nao foi possivel adicionar ao carrinho');
      }
    },
    [add]
  );

  return (
    <Screen>
      <HeaderBar
        title="Detalhes"
        rightIcon={favorite ? 'heart' : 'heart-outline'}
        rightIconActive={favorite}
        onRightPress={product ? () => toggleFavorite(product.id) : undefined}
      />
      {loading && (
        <Text selectable style={styles.feedbackText}>
          Carregando produto...
        </Text>
      )}
      {error && (
        <Text selectable style={styles.feedbackText}>
          Nao foi possivel carregar o produto.
        </Text>
      )}
      {product && <ProductVisual product={product} large />}
      <View style={styles.gallery}>
        {(products ?? []).slice(0, 5).map((item) => (
          <View key={item.id} style={[styles.galleryItem, item.id === product?.id && styles.galleryActive]}>
            <ProductVisual product={item} />
          </View>
        ))}
      </View>

      {product && (
        <>
          <View style={styles.nameRow}>
            <View style={styles.nameColumn}>
              <Text selectable style={styles.productName}>
                {product.nome}
              </Text>
              <Text selectable style={styles.subtitle}>
                {product.categoria}
              </Text>
            </View>
            <Text selectable style={styles.price}>
              {new Intl.NumberFormat('pt-BR', {
                currency: 'BRL',
                style: 'currency',
              }).format(product.preco)}
            </Text>
          </View>

          <View style={styles.sizeTop}>
            <Text selectable style={styles.sizeTitle}>
              Estoque
            </Text>
            <Text selectable style={styles.sizeChart}>
              {product.estoque} unidades
            </Text>
          </View>

          <Text selectable style={styles.description}>
            {product.descricao}
          </Text>

          <View style={styles.bottomActions}>
            {cartMessage && (
              <View style={styles.cartMessage}>
                <Ionicons name="checkmark-circle" size={18} color={palette.primary} />
                <Text selectable style={styles.cartMessageText}>
                  {cartMessage}
                </Text>
              </View>
            )}

            <View style={styles.buyRow}>
              <Pressable style={styles.cartButton} onPress={() => handleAddToCart(product.id)}>
                <Ionicons name="cart-outline" size={22} color={palette.text} />
              </Pressable>
              <PrimaryButton label="Comprar agora" href="/checkout" onPress={() => handleAddToCart(product.id)} />
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  gallery: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  galleryItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 48,
    overflow: 'hidden',
    padding: 2,
    width: 48,
  },
  galleryActive: {
    borderColor: palette.primary,
    borderWidth: 2,
  },
  nameRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  nameColumn: {
    flex: 1,
  },
  productName: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  price: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '900',
  },
  sizeTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sizeTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '800',
  },
  sizeChart: {
    color: '#79a8dc',
    fontSize: 12,
    fontWeight: '800',
  },
  sizes: {
    flexDirection: 'row',
    gap: 10,
  },
  sizeBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  sizeSelected: {
    borderColor: palette.primary,
    borderWidth: 2,
  },
  sizeText: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  sizeTextSelected: {
    color: palette.primary,
  },
  description: {
    color: '#b1b1bd',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 21,
  },
  buyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bottomActions: {
    gap: 12,
    marginTop: 'auto',
  },
  cartButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  cartMessage: {
    alignItems: 'center',
    backgroundColor: '#efe8ff',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cartMessageText: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  feedbackText: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '700',
  },
});
