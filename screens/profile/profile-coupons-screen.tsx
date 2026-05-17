import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HeaderBar, Screen, palette } from '@/components/shop/shop-ui';
import { useApiQuery } from '@/hooks/use-api-query';
import { getCoupons } from '@/services/shop-api';

export default function ProfileCouponsScreen() {
  const couponsQuery = useApiQuery(() => getCoupons(), 'profile-coupons-screen');

  return (
    <Screen>
      <View style={styles.headerOffset}>
        <HeaderBar title="Cupons" />
      </View>
      <Text selectable style={styles.sectionTitle}>
        Cupons disponiveis
      </Text>
      {couponsQuery.loading && (
        <Text selectable style={styles.emptyText}>
          Carregando cupons...
        </Text>
      )}
      {couponsQuery.error && (
        <Text selectable style={styles.emptyText}>
          Nao foi possivel carregar os cupons.
        </Text>
      )}
      {(couponsQuery.data ?? []).map((coupon) => (
        <View key={coupon.id} style={styles.card}>
          <Text selectable style={styles.cardTitle}>
            {coupon.codigo}
          </Text>
          <Text selectable style={styles.cardText}>
            {coupon.descricao}
          </Text>
          <Text selectable style={styles.cardAccent}>
            {coupon.ativo ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
      ))}
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
    backgroundColor: '#fff',
    borderRadius: 16,
    gap: 5,
    padding: 14,
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
    fontSize: 12,
    fontWeight: '900',
  },
  emptyText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
