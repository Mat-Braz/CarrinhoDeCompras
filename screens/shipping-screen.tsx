import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HeaderBar, PrimaryButton, Screen, StepPill, palette } from '@/components/shop/shop-ui';

const methods = [
  { title: 'Regular', subtitle: 'Entrega em 3-5 dias', price: 'R$ 15,00', icon: 'cube-outline' },
  { title: 'Expressa', subtitle: 'Entrega em 1-2 dias', price: 'R$ 29,90', icon: 'flash-outline' },
  { title: 'Retirada', subtitle: 'Retirar na loja', price: 'R$ 0,00', icon: 'storefront-outline' },
] as const;

export default function ShippingScreen() {
  return (
    <Screen>
      <HeaderBar title="Entrega" />
      <View style={styles.steps}>
        <StepPill label="Detalhes" />
        <StepPill label="Entrega" active />
        <StepPill label="Pagamento" />
      </View>

      <View style={styles.addressCard}>
        <Text selectable style={styles.cardTitle}>
          Endereco de entrega
        </Text>
        <Text selectable style={styles.address}>
          3517 W. Gray St. Utica, Pennsylvania 57867
        </Text>
        <Text selectable style={styles.linkText}>
          Editar endereco
        </Text>
      </View>

      <Text selectable style={styles.sectionTitle}>
        Opcao de entrega
      </Text>
      <View style={styles.methods}>
        {methods.map((method, index) => (
          <View key={method.title} style={[styles.method, index === 0 && styles.methodActive]}>
            <View style={[styles.methodIcon, index === 0 && styles.methodIconActive]}>
              <Ionicons
                name={method.icon}
                size={20}
                color={index === 0 ? '#fff' : palette.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text selectable style={styles.methodTitle}>
                {method.title}
              </Text>
              <Text selectable style={styles.methodSubtitle}>
                {method.subtitle}
              </Text>
            </View>
            <Text selectable style={styles.methodPrice}>
              {method.price}
            </Text>
          </View>
        ))}
      </View>

      <PrimaryButton label="Continuar para pagamento" href="/payment" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  steps: {
    flexDirection: 'row',
    gap: 10,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    gap: 10,
    padding: 18,
  },
  cardTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '900',
  },
  address: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
  },
  linkText: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '900',
  },
  methods: {
    gap: 12,
  },
  method: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 14,
    padding: 14,
  },
  methodActive: {
    borderColor: palette.primary,
    borderWidth: 2,
  },
  methodIcon: {
    alignItems: 'center',
    backgroundColor: '#efe8ff',
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  methodIconActive: {
    backgroundColor: palette.primary,
  },
  methodTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '900',
  },
  methodSubtitle: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  methodPrice: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '900',
  },
});
