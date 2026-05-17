import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HeaderBar, ProductVisual, Screen, palette } from '@/components/shop/shop-ui';
import { useFavorites } from '@/contexts/favorites-context';
import { useApiQuery } from '@/hooks/use-api-query';
import { getProducts } from '@/services/shop-api';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

export default function ProfileFavoritesScreen() {
  const { favoriteIds } = useFavorites();
  const productsQuery = useApiQuery(() => getProducts(), 'profile-favorites-screen');
  const favoriteProducts = (productsQuery.data ?? []).filter((product) =>
    favoriteIds.includes(product.id)
  );

  return (
    <Screen>
      <View style={styles.headerOffset}>
        <HeaderBar title="Favoritos" />
      </View>
      <Text selectable style={styles.sectionTitle}>
        Produtos favoritos
      </Text>
      {productsQuery.loading && (
        <Text selectable style={styles.emptyText}>
          Carregando favoritos...
        </Text>
      )}
      {favoriteProducts.length === 0 && !productsQuery.loading ? (
        <Text selectable style={styles.emptyText}>
          Nenhum produto favorito.
        </Text>
      ) : (
        favoriteProducts.map((product) => (
          <Link href={`/product/${product.id}`} asChild key={product.id}>
            <Pressable style={styles.card}>
              <View style={styles.thumb}>
                <ProductVisual product={product} />
              </View>
              <View style={styles.cardBody}>
                <Text selectable style={styles.cardTitle}>
                  {product.nome}
                </Text>
                <Text selectable style={styles.cardText}>
                  {product.categoria}
                </Text>
                <Text selectable style={styles.cardAccent}>
                  {currencyFormatter.format(product.preco)}
                </Text>
              </View>
            </Pressable>
          </Link>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerOffset: {
    paddingTop: 18,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '900',
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 14,
    padding: 10,
  },
  thumb: {
    width: 72,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '900',
  },
  cardText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  cardAccent: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  emptyText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
