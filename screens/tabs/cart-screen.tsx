import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  HeaderBar,
  PriceRow,
  ProductVisual,
  Screen,
  palette,
} from "@/components/shop/shop-ui";
import { useApiQuery } from "@/hooks/use-api-query";
import { useCart } from "@/hooks/use-cart";
import { getCoupons } from "@/services/shop-api";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

export default function CartScreen() {
  const [selectedCoupon, setSelectedCoupon] = React.useState<string | undefined>();
  const couponsQuery = useApiQuery(() => getCoupons(), "coupons");
  const { data: coupons, refetch: refetchCoupons } = couponsQuery;
  const { clear, data: cart, decrement, error, increment, loading, refetch, remove } = useCart(selectedCoupon);
  const items = cart?.itens ?? [];
  const activeCoupons = React.useMemo(
    () => (coupons ?? []).filter((coupon) => coupon.ativo),
    [coupons]
  );

  React.useEffect(() => {
    if (selectedCoupon && !activeCoupons.some((coupon) => coupon.codigo === selectedCoupon)) {
      setSelectedCoupon(undefined);
    }
  }, [activeCoupons, selectedCoupon]);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
      refetchCoupons();
    }, [refetch, refetchCoupons])
  );

  return (
    <Screen>
      <View style={styles.headerOffset}>
        <HeaderBar title="Carrinho" />
      </View>
      {loading && (
        <Text selectable style={styles.feedbackText}>
          Carregando carrinho...
        </Text>
      )}
      {error && (
        <Text selectable style={styles.feedbackText}>
          Nao foi possivel carregar o carrinho.
        </Text>
      )}
      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <View style={styles.thumb}>
              <ProductVisual product={item.produto} />
            </View>
            <View style={styles.itemInfo}>
              <Text selectable style={styles.itemName}>
                {item.produto.nome}
              </Text>
              <Text selectable style={styles.itemSize}>
                {item.produto.categoria}
              </Text>
              <Text selectable style={styles.itemPrice}>
                {currencyFormatter.format(item.total)}
              </Text>
            </View>
            <View style={styles.qty}>
              <Pressable
                accessibilityLabel={`Diminuir quantidade de ${item.produto.nome}`}
                accessibilityRole="button"
                onPress={() => decrement(item.id, item.quantidade)}
                style={styles.qtyButton}>
                <Ionicons name="remove" size={15} color={palette.text} />
              </Pressable>
              <Text selectable style={styles.qtyText}>
                {item.quantidade}
              </Text>
              <Pressable
                accessibilityLabel={`Aumentar quantidade de ${item.produto.nome}`}
                accessibilityRole="button"
                onPress={() => increment(item.id, item.quantidade)}
                style={styles.qtyPlus}>
                <Ionicons name="add" size={15} color="#fff" />
              </Pressable>
              <Pressable
                accessibilityLabel={`Remover ${item.produto.nome} do carrinho`}
                accessibilityRole="button"
                onPress={() => remove(item.id)}
                style={styles.removeButton}>
                <Ionicons name="trash-outline" size={16} color="#d13b3b" />
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      {!loading && items.length === 0 && (
        <Text selectable style={styles.feedbackText}>
          Seu carrinho esta vazio.
        </Text>
      )}

      {items.length > 0 && (
        <>
          <View style={styles.couponSection}>
            <Text selectable style={styles.couponTitle}>
              Cupons
            </Text>
            <View style={styles.couponList}>
              <Pressable
                onPress={() => setSelectedCoupon(undefined)}
                style={[styles.couponChip, !selectedCoupon && styles.couponChipActive]}>
                <Text selectable style={[styles.couponText, !selectedCoupon && styles.couponTextActive]}>
                  Sem cupom
                </Text>
              </Pressable>
              {activeCoupons.map((coupon) => (
                <Pressable
                  key={coupon.id}
                  onPress={() => setSelectedCoupon(coupon.codigo)}
                  style={[
                    styles.couponChip,
                    selectedCoupon === coupon.codigo && styles.couponChipActive,
                  ]}>
                  <Text
                    selectable
                    style={[
                      styles.couponText,
                      selectedCoupon === coupon.codigo && styles.couponTextActive,
                    ]}>
                    {coupon.codigo}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.summary}>
            <PriceRow label="Subtotal dos produtos" value={currencyFormatter.format(cart?.subtotal ?? 0)} />
            <PriceRow label="Subtotal da entrega" value={currencyFormatter.format(cart?.frete ?? 0)} />
            <PriceRow label="Cupons de desconto" value={`-${currencyFormatter.format(cart?.desconto ?? 0)}`} />
            <View style={styles.divider} />
            <PriceRow label="Total" value={currencyFormatter.format(cart?.total ?? 0)} strong />
            <View style={styles.summaryActions}>
              <Pressable style={styles.clearButton} onPress={clear}>
                <Text selectable style={styles.clearText}>
                  Limpar tudo
                </Text>
              </Pressable>
              <Link
                href={{
                  pathname: "/checkout",
                  params: selectedCoupon ? { cupom: selectedCoupon } : {},
                }}
                asChild>
                <Pressable style={styles.checkoutButton}>
                  <Text selectable style={styles.checkoutText}>
                    Finalizar compra
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerOffset: {
    paddingTop: 18,
  },
  list: {
    gap: 14,
  },
  cartItem: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    flexDirection: "row",
    gap: 14,
    padding: 10,
  },
  thumb: {
    width: 72,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "900",
  },
  itemSize: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  itemPrice: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "900",
  },
  qty: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  qtyText: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "800",
  },
  qtyButton: {
    alignItems: "center",
    backgroundColor: "#f1f1f5",
    borderRadius: 6,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  qtyPlus: {
    alignItems: "center",
    backgroundColor: palette.primary,
    borderRadius: 6,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  removeButton: {
    alignItems: "center",
    backgroundColor: "#ffe8e8",
    borderRadius: 6,
    height: 26,
    justifyContent: "center",
    width: 26,
  },
  couponSection: {
    gap: 10,
  },
  couponTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900",
  },
  couponList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  couponChip: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  couponChipActive: {
    backgroundColor: palette.primary,
  },
  couponText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "800",
  },
  couponTextActive: {
    color: "#fff",
  },
  summary: {
    backgroundColor: palette.primary,
    borderRadius: 28,
    gap: 17,
    marginBottom: 28,
    padding: 22,
  },
  divider: {
    borderColor: "#a982ef",
    borderStyle: "dashed",
    borderTopWidth: 1,
  },
  summaryActions: {
    flexDirection: "row",
    gap: 10,
  },
  clearButton: {
    alignItems: "center",
    backgroundColor: "#8a5ce0",
    borderRadius: 13,
    flex: 1,
    height: 54,
    justifyContent: "center",
  },
  clearText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
  checkoutButton: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 13,
    flex: 1,
    height: 54,
    justifyContent: "center",
  },
  checkoutText: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "900",
  },
  feedbackText: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});
