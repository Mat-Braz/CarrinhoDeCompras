import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  HeaderBar,
  PriceRow,
  PrimaryButton,
  ProductVisual,
  Screen,
  StepPill,
  palette,
} from '@/components/shop/shop-ui';
import { useCart } from '@/hooks/use-cart';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

export default function CheckoutDetailsScreen() {
  const { data: cart } = useCart();
  const items = cart?.itens ?? [];

  return (
    <Screen>
      <HeaderBar title="Detalhes do pedido" />
      <View style={styles.steps}>
        <StepPill label="Detalhes" active />
        <StepPill label="Entrega" />
        <StepPill label="Pagamento" />
      </View>

      <View style={styles.card}>
        <Text selectable style={styles.cardTitle}>
          Produtos
        </Text>
        {items.map((item) => (
          <View key={item.id} style={styles.productRow}>
            <View style={styles.thumb}>
              <ProductVisual product={item.produto} />
            </View>
            <View style={styles.productInfo}>
              <Text selectable style={styles.productName}>
                {item.produto.nome}
              </Text>
              <Text selectable style={styles.productMeta}>
                Qtd. {item.quantidade}
              </Text>
            </View>
            <Text selectable style={styles.productPrice}>
              {currencyFormatter.format(item.total)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text selectable style={styles.cardTitle}>
          Endereco de entrega
        </Text>
        <View style={styles.addressRow}>
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={18} color={palette.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text selectable style={styles.addressTitle}>
              3517 W. Gray St. Utica
            </Text>
            <Text selectable style={styles.productMeta}>
              Sao Paulo, BR
            </Text>
          </View>
          <Text selectable style={styles.change}>
            Alterar
          </Text>
        </View>
      </View>

      <View style={styles.summary}>
        <PriceRow label="Subtotal" value={currencyFormatter.format(cart?.subtotal ?? 0)} />
        <PriceRow label="Entrega" value={currencyFormatter.format(cart?.frete ?? 0)} />
        <PriceRow label="Desconto" value={`-${currencyFormatter.format(cart?.desconto ?? 0)}`} />
        <View style={styles.divider} />
        <PriceRow label="Total" value={currencyFormatter.format(cart?.total ?? 0)} strong />
      </View>
      <PrimaryButton label="Continuar para entrega" href="/shipping" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  steps: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    gap: 14,
    padding: 16,
  },
  cardTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '900',
  },
  productRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  thumb: {
    width: 64,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '900',
  },
  productMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  productPrice: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '900',
  },
  addressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  locationIcon: {
    alignItems: 'center',
    backgroundColor: '#efe8ff',
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  addressTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '900',
  },
  change: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  summary: {
    backgroundColor: palette.primary,
    borderRadius: 24,
    gap: 15,
    padding: 20,
  },
  divider: {
    borderColor: '#a982ef',
    borderStyle: 'dashed',
    borderTopWidth: 1,
  },
});
