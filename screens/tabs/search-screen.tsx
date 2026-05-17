import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProductCard, Screen, SearchBar, SectionHeader, palette } from '@/components/shop/shop-ui';
import { useApiQuery } from '@/hooks/use-api-query';
import { getProducts } from '@/services/shop-api';

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Todos');
  const hasSearchTerm = searchTerm.trim().length > 0;
  const categoryFilter = selectedCategory === 'Todos' ? undefined : selectedCategory;
  const { data: allProducts } = useApiQuery(() => getProducts(), 'all-products');
  const { data: filteredProducts, error, loading } = useApiQuery(
    () =>
      getProducts({
        categoria: categoryFilter,
        nome: searchTerm.trim(),
      }),
    `${categoryFilter ?? 'todos'}:${searchTerm}`
  );
  const categories = React.useMemo(
    () => ['Todos', ...new Set((allProducts ?? []).map((product) => product.categoria))],
    [allProducts]
  );

  return (
    <Screen>
      <Text selectable style={styles.title}>
        Buscar
      </Text>
      <SearchBar
        placeholder="Buscar por nome"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      {!hasSearchTerm && (
        <View style={styles.chips}>
          {categories.map((category) => {
            const isActive = selectedCategory === category;

            return (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[styles.chip, isActive && styles.chipActive]}>
              <Text selectable style={[styles.chipText, isActive && styles.chipTextActive]}>
                {category}
              </Text>
            </Pressable>
            );
          })}
        </View>
      )}
      {!hasSearchTerm && <SectionHeader title="Produtos populares" action="Filtrar" />}
      <View style={styles.productGrid}>
        {(filteredProducts ?? []).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
      {loading && (
        <Text selectable style={styles.emptyText}>
          Carregando produtos...
        </Text>
      )}
      {error && (
        <Text selectable style={styles.emptyText}>
          Nao foi possivel carregar os produtos.
        </Text>
      )}
      {!loading && !error && (filteredProducts ?? []).length === 0 && (
        <Text selectable style={styles.emptyText}>
          Nenhum produto encontrado
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: palette.text,
    fontSize: 26,
    fontWeight: '900',
    paddingTop: 18,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  chipActive: {
    backgroundColor: palette.primary,
  },
  chipText: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '800',
  },
  chipTextActive: {
    color: '#fff',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  emptyText: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
