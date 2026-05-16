import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HeaderBar, PriceRow, Screen, StepPill, palette } from '@/components/shop/shop-ui';
import { useCart } from '@/hooks/use-cart';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

export default function PaymentScreen() {
  const { data: cart } = useCart();

  return (
    <Screen>
      <HeaderBar title="Pagamento" />
      <View style={styles.steps}>
        <StepPill label="Detalhes" />
        <StepPill label="Entrega" />
        <StepPill label="Pagamento" active />
      </View>

      <View style={styles.creditCard}>
        <View style={styles.cardTop}>
          <Text selectable style={styles.cardBrand}>
            VISA
          </Text>
          <Ionicons name="wifi" size={20} color="#fff" />
        </View>
        <Text selectable style={styles.cardNumber}>
          4582  ••••  ••••  2049
        </Text>
        <View style={styles.cardBottom}>
          <View>
            <Text selectable style={styles.cardLabel}>
              Card holder
            </Text>
            <Text selectable style={styles.cardValue}>
              Christian
            </Text>
          </View>
          <View>
            <Text selectable style={styles.cardLabel}>
              Expires
            </Text>
            <Text selectable style={styles.cardValue}>
              09/29
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.paymentList}>
        {['Cartao de credito', 'Pix', 'PayPal', 'Dinheiro na entrega'].map((item, index) => (
          <View key={item} style={[styles.paymentRow, index === 0 && styles.paymentActive]}>
            <View style={[styles.radio, index === 0 && styles.radioActive]} />
            <Text selectable style={styles.paymentText}>
              {item}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <PriceRow label="Produtos" value={currencyFormatter.format(cart?.subtotal ?? 0)} />
        <PriceRow label="Entrega" value={currencyFormatter.format(cart?.frete ?? 0)} />
        <PriceRow label="Desconto" value={`-${currencyFormatter.format(cart?.desconto ?? 0)}`} />
        <View style={styles.divider} />
        <PriceRow label="Total" value={currencyFormatter.format(cart?.total ?? 0)} strong />
        <Pressable style={styles.payButton}>
          <Text selectable style={styles.payText}>
            Pagar agora
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  steps: {
    flexDirection: 'row',
    gap: 10,
  },
  creditCard: {
    backgroundColor: palette.primary,
    borderRadius: 24,
    gap: 28,
    minHeight: 190,
    padding: 22,
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardBrand: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  cardNumber: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 0,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: '#d7c5ff',
    fontSize: 11,
    fontWeight: '800',
  },
  cardValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 5,
  },
  paymentList: {
    gap: 12,
  },
  paymentRow: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 17,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  paymentActive: {
    borderColor: palette.primary,
    borderWidth: 2,
  },
  radio: {
    borderColor: '#d4d4df',
    borderRadius: 999,
    borderWidth: 2,
    height: 18,
    width: 18,
  },
  radioActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  paymentText: {
    color: palette.text,
    fontSize: 14,
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
  payButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 13,
    height: 54,
    justifyContent: 'center',
  },
  payText: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '900',
  },
});
