import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HeaderBar, Screen, palette } from '@/components/shop/shop-ui';
import { useApiQuery } from '@/hooks/use-api-query';
import { getOrders } from '@/services/shop-api';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export default function ProfileOrdersScreen() {
  const ordersQuery = useApiQuery(() => getOrders(), 'profile-orders');
  const completedOrders = ordersQuery.data ?? [];

  return (
    <Screen>
      <View style={styles.headerOffset}>
        <HeaderBar title="Pedidos" />
      </View>
      <Text selectable style={styles.sectionTitle}>
        Pedidos concluidos
      </Text>
      {ordersQuery.loading ? (
        <Text selectable style={styles.emptyText}>
          Carregando pedidos...
        </Text>
      ) : null}
      {ordersQuery.error ? (
        <Text selectable style={styles.emptyText}>
          Nao foi possivel carregar os pedidos.
        </Text>
      ) : null}
      {!ordersQuery.loading && completedOrders.length === 0 ? (
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
              {dateFormatter.format(new Date(order.criadoEm))} - {currencyFormatter.format(order.total)}
            </Text>
            <Text selectable style={styles.cardText}>
              {order.itens.length} item(ns) - {order.formaPagamento}
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
