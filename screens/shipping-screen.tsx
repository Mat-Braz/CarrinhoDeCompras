import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HeaderBar, PrimaryButton, Screen, StepPill, palette } from '@/components/shop/shop-ui';
import { useCart } from '@/hooks/use-cart';
import { DeliveryMethod } from '@/services/shop-api';

const methods = [
  { id: 'regular', title: 'Regular', subtitle: 'Entrega em 3-5 dias', price: 'R$ 15,00', icon: 'cube-outline' },
  { id: 'expressa', title: 'Expressa', subtitle: 'Entrega em 1-2 dias', price: 'R$ 29,90', icon: 'flash-outline' },
  { id: 'retirada', title: 'Retirada', subtitle: 'Retirar na loja', price: 'R$ 0,00', icon: 'storefront-outline' },
] as const;

export default function ShippingScreen() {
  const params = useLocalSearchParams<{
    bairro?: string;
    cidade?: string;
    complemento?: string;
    cupom?: string;
    endereco?: string;
    numero?: string;
    uf?: string;
  }>();
  const couponCode = typeof params.cupom === 'string' ? params.cupom : undefined;
  const [selectedMethod, setSelectedMethod] = React.useState<DeliveryMethod>('regular');
  const { data: cart } = useCart(couponCode, selectedMethod);
  const paymentParams = {
    bairro: params.bairro ?? '',
    cidade: params.cidade ?? '',
    complemento: params.complemento ?? '',
    endereco: params.endereco ?? '',
    entrega: selectedMethod,
    numero: params.numero ?? '',
    uf: params.uf ?? '',
    ...(couponCode && cart?.cupomAplicado ? { cupom: couponCode } : {}),
  };

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
          {params.endereco}, {params.numero} - {params.bairro}, {params.cidade}/{params.uf}
        </Text>
        <Text selectable style={styles.linkText}>
          Editar endereco
        </Text>
      </View>

      <Text selectable style={styles.sectionTitle}>
        Opcao de entrega
      </Text>
      <View style={styles.methods}>
        {methods.map((method) => {
          const active = selectedMethod === method.id;

          return (
          <Pressable
            key={method.id}
            onPress={() => setSelectedMethod(method.id)}
            style={[styles.method, active && styles.methodActive]}>
            <View style={[styles.methodIcon, active && styles.methodIconActive]}>
              <Ionicons
                name={method.icon}
                size={20}
                color={active ? '#fff' : palette.primary}
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
          </Pressable>
          );
        })}
      </View>

      <View style={styles.totalCard}>
        <Text selectable style={styles.totalLabel}>
          Total com entrega
        </Text>
        <Text selectable style={styles.totalValue}>
          {new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(cart?.total ?? 0)}
        </Text>
      </View>

      <PrimaryButton label="Continuar para pagamento" href={{ pathname: '/payment', params: paymentParams }} />
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
  totalCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  totalLabel: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  totalValue: {
    color: palette.primary,
    fontSize: 16,
    fontWeight: '900',
  },
});
