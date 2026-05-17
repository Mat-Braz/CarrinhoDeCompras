import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HeaderBar, Screen, palette } from '@/components/shop/shop-ui';

const completedOrders: { id: string; date: string; total: string; status: string }[] = [];

export default function ProfileOrdersScreen() {
  return (
    <Screen>
      <View style={styles.headerOffset}>
        <HeaderBar title="Pedidos" />
      </View>
      <Text selectable style={styles.sectionTitle}>
        Pedidos concluidos
      </Text>
      {completedOrders.length === 0 ? (
        <Text selectable style={styles.emptyText}>
          Nenhum pedido concluido.
        </Text>
      ) : (
        completedOrders.map((order) => (
          <View key={order.id} style={styles.card}>
            <Text selectable style={styles.cardTitle}>
              Pedido {order.id}
            </Text>
            <Text selectable style={styles.cardText}>
              {order.date} - {order.total}
            </Text>
            <Text selectable style={styles.cardAccent}>
              {order.status}
            </Text>
          </View>
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
