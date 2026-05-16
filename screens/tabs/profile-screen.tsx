import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconButton, Screen, palette } from "@/components/shop/shop-ui";

const profileOptions = [
  { icon: "receipt-outline", label: "Pedidos" },
  { icon: "ticket-outline", label: "Cupons" },
  { icon: "heart-outline", label: "Produtos favoritos" },
  { icon: "settings-outline", label: "Configuracoes" },
] as const;

export default function ProfileScreen() {
  return (
    <Screen>
      <Text selectable style={styles.title}>
        Perfil
      </Text>
      <View style={styles.card}>
        <Pressable
          accessibilityLabel="Editar perfil"
          accessibilityRole="button"
          style={styles.editButton}>
          <IconButton icon="create-outline" />
        </Pressable>
        <View style={styles.avatar}>
          <Text selectable style={styles.avatarText}>
            C
          </Text>
        </View>
        <Text selectable style={styles.name}>
          Christian
        </Text>
        <Text selectable style={styles.email}>
          christian@email.com
        </Text>
      </View>
      {profileOptions.map((item) => (
        <View key={item.label} style={styles.row}>
          <IconButton icon={item.icon} />
          <Text selectable style={styles.rowText}>
            {item.label}
          </Text>
        </View>
      ))}
      <Pressable
        accessibilityLabel="Sair da conta"
        accessibilityRole="button"
        style={styles.logoutRow}>
        <View style={styles.logoutIcon}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
        </View>
        <Text selectable style={styles.logoutText}>
          Sair da conta
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: palette.text,
    fontSize: 26,
    fontWeight: "900",
  },
  card: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 22,
    gap: 8,
    padding: 24,
    position: "relative",
  },
  editButton: {
    position: "absolute",
    right: 14,
    top: 14,
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
  logoutRow: {
    alignItems: "center",
    backgroundColor: "#d13b3b",
    borderRadius: 18,
    flexDirection: "row",
    gap: 14,
    marginTop: 4,
    padding: 14,
  },
  logoutIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: 18,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  logoutText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});
