import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HeaderBar, Screen, palette } from '@/components/shop/shop-ui';
import { useApiQuery } from '@/hooks/use-api-query';
import { getNotifications } from '@/services/shop-api';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: '2-digit',
});

export default function ProfileNotificationsScreen() {
  const notificationsQuery = useApiQuery(() => getNotifications(), 'profile-notifications');
  const notifications = notificationsQuery.data ?? [];

  return (
    <Screen>
      <View style={styles.headerOffset}>
        <HeaderBar title="Notificacoes" />
      </View>
      <Text selectable style={styles.sectionTitle}>
        Atualizacoes da conta
      </Text>
      {notificationsQuery.loading ? (
        <Text selectable style={styles.emptyText}>
          Carregando notificacoes...
        </Text>
      ) : null}
      {notificationsQuery.error ? (
        <Text selectable style={styles.emptyText}>
          Nao foi possivel carregar as notificacoes.
        </Text>
      ) : null}
      {!notificationsQuery.loading && notifications.length === 0 ? (
        <Text selectable style={styles.emptyText}>
          Nenhuma notificacao por enquanto.
        </Text>
      ) : null}
      {notifications.map((notification) => (
        <View key={notification.id} style={styles.card}>
          <View style={styles.iconBox}>
            <Ionicons name="notifications-outline" size={20} color={palette.primary} />
          </View>
          <View style={styles.cardBody}>
            <Text selectable style={styles.cardTitle}>
              {notification.titulo}
            </Text>
            <Text selectable style={styles.cardMessage}>
              {notification.mensagem}
            </Text>
            <Text selectable style={styles.cardDate}>
              {dateFormatter.format(new Date(notification.criadaEm))}
            </Text>
          </View>
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
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: '#efe8ff',
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  cardBody: {
    flex: 1,
    gap: 5,
  },
  cardTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '900',
  },
  cardMessage: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  cardDate: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
