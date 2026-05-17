import { Link } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  IconButton,
  ProductCard,
  ProductVisual,
  Screen,
  SectionHeader,
  palette,
} from "@/components/shop/shop-ui";
import { useApiQuery } from "@/hooks/use-api-query";
import { getProducts } from "@/services/shop-api";

export default function HomeScreen() {
  const { data: products, error, loading } = useApiQuery(() => getProducts(), 'home-products');
  const heroProduct = products?.[0];

  return (
    <Screen>
      <View style={styles.top}>
        <View>
          <Text selectable style={styles.welcome}>
            Bem-Vindo de volta,
          </Text>
          <Text selectable style={styles.name}>
            Boer
          </Text>
        </View>
        <View style={styles.topActions}>
          <Link href="/(tabs)/search" asChild>
            <Pressable>
              <IconButton icon="search" />
            </Pressable>
          </Link>
          <IconButton icon="notifications-outline" />
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text selectable style={styles.heroTitle}>
            Promoção
          </Text>
          <Text selectable style={styles.heroSubtitle}>
            Desconto para novos usuários
          </Text>
          <Pressable style={styles.heroButton}>
            <Text selectable style={styles.heroButtonText}>
              Conferir
            </Text>
          </Pressable>
        </View>
        {heroProduct && (
          <View style={styles.heroShoe}>
            <ProductVisual product={heroProduct} />
          </View>
        )}
      </View>

      <View style={styles.dots}>
        {[0, 1, 2, 3, 4].map((dot) => (
          <View key={dot} style={[styles.dot, dot === 0 && styles.dotActive]} />
        ))}
      </View>

      <SectionHeader title="Recomendações" />
      {loading && (
        <Text selectable style={styles.feedbackText}>
          Carregando produtos...
        </Text>
      )}
      {error && (
        <Text selectable style={styles.feedbackText}>
          Nao foi possivel carregar os produtos.
        </Text>
      )}
      <View style={styles.productGrid}>
        {(products ?? []).slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 18,
  },
  welcome: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  name: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 4,
  },
  topActions: {
    flexDirection: "row",
    gap: 10,
  },
  hero: {
    alignItems: "center",
    backgroundColor: palette.primary,
    borderRadius: 20,
    flexDirection: "row",
    minHeight: 134,
    overflow: "hidden",
    padding: 18,
  },
  heroText: {
    flex: 1,
    gap: 6,
    zIndex: 2,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  heroSubtitle: {
    color: "#dccfff",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  heroButton: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    height: 32,
    justifyContent: "center",
    marginTop: 5,
    width: 90,
    padding: 10,
  },
  heroButtonText: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  heroShoe: {
    bottom: -8,
    position: "absolute",
    right: 4,
    transform: [{ rotate: "-8deg" }],
    width: 162,
  },
  dots: {
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    backgroundColor: "#d9d9e2",
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  dotActive: {
    backgroundColor: palette.primary,
    width: 18,
  },
  categories: {
    flexDirection: "row",
    gap: 12,
  },
  category: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    height: 42,
    justifyContent: "center",
    minWidth: 46,
    paddingHorizontal: 12,
  },
  categoryActive: {
    backgroundColor: palette.primary,
  },
  categoryTextActive: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  feedbackText: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: "700",
  },
});
