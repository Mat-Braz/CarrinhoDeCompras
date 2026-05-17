import { Link } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconButton, Screen, palette } from "@/components/shop/shop-ui";

const profileOptions = [
  { href: "/profile-orders", icon: "receipt-outline", label: "Pedidos" },
  { href: "/profile-coupons", icon: "ticket-outline", label: "Cupons" },
  { href: "/profile-favorites", icon: "heart-outline", label: "Produtos favoritos" },
] as const;

export default function ProfileScreen() {
  return (
    <Screen>
      <Text selectable style={styles.title}>
        Perfil
      </Text>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text selectable style={styles.avatarText}>
            B
          </Text>
        </View>
        <Text selectable style={styles.name}>
          Boer
        </Text>
        <Text selectable style={styles.email}>
          boer@gmail.com
        </Text>
      </View>
      {profileOptions.map((item) => (
        <Link href={item.href} asChild key={item.label}>
          <Pressable accessibilityRole="button" style={styles.row}>
            <IconButton icon={item.icon} />
            <Text selectable style={styles.rowText}>
              {item.label}
            </Text>
          </Pressable>
        </Link>
      ))}
      <Link href="/admin" asChild>
        <Pressable accessibilityRole="button" style={styles.row}>
          <IconButton icon="shield-checkmark-outline" />
          <Text selectable style={styles.rowText}>
            Painel administrativo
          </Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: palette.text,
    fontSize: 26,
    fontWeight: "900",
    paddingTop: 18,
  },
  card: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 22,
    gap: 8,
    padding: 24,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#efe8ff",
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  avatarText: {
    color: palette.primary,
    fontSize: 28,
    fontWeight: "900",
  },
  name: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900",
  },
  email: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  row: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    flexDirection: "row",
    gap: 14,
    padding: 14,
  },
  rowText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "800",
  },
});
