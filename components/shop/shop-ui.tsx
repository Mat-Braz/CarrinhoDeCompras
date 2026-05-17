import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import type { Href } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFavorites } from '@/contexts/favorites-context';
import type { ApiProduct } from '@/services/shop-api';

export const palette = {
  background: '#f6f6f8',
  card: '#ffffff',
  text: '#1f1f2b',
  muted: '#9a9aa7',
  primary: '#6f33d1',
  primaryDark: '#5425b7',
  line: '#ececf2',
  gold: '#ffbf22',
};

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={styles.screen}>
      {children}
    </ScrollView>
  );
}

export function IconButton({
  icon,
  active = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
}) {
  return (
    <View style={[styles.iconButton, active && styles.iconButtonActive]}>
      <Ionicons name={icon} size={18} color={active ? palette.primary : palette.text} />
    </View>
  );
}

export function HeaderBar({
  title,
  rightIcon = 'ellipsis-vertical',
  rightIconActive = false,
  onRightPress,
}: {
  title: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightIconActive?: boolean;
  onRightPress?: () => void;
}) {
  const rightButton = <IconButton icon={rightIcon} active={rightIconActive} />;

  return (
    <View style={styles.headerBar}>
      <Link href="../" asChild>
        <Pressable>
          <IconButton icon="chevron-back" />
        </Pressable>
      </Link>
      <Text selectable style={styles.headerTitle}>
        {title}
      </Text>
      {onRightPress ? <Pressable onPress={onRightPress}>{rightButton}</Pressable> : rightButton}
    </View>
  );
}

export function SectionHeader({ title, action = 'Ver todos' }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text selectable style={styles.sectionTitle}>
        {title}
      </Text>
      <Text selectable style={styles.sectionAction}>
        {action}
      </Text>
    </View>
  );
}

export function SearchBar({
  placeholder = 'Buscar produtos',
  value,
  onChangeText,
}: {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}) {
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search" size={18} color={palette.muted} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        value={value}
        onChangeText={onChangeText}
        style={styles.searchInput}
      />
      <Ionicons name="options-outline" size={18} color={palette.text} />
    </View>
  );
}

export function ProductVisual({ product, large = false }: { product: ApiProduct; large?: boolean }) {
  if (product.imagem) {
    return (
      <View style={[styles.visual, large ? styles.visualLarge : styles.visualSmall]}>
        <Image
          source={product.imagem}
          style={styles.productImage}
          contentFit="cover"
          transition={150}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.visual,
        large ? styles.visualLarge : styles.visualSmall,
        { backgroundColor: '#efe8ff' },
      ]}>
      <View
        style={[
          styles.shoeUpper,
          large && styles.shoeUpperLarge,
          { backgroundColor: palette.primary },
        ]}
      />
      <View
        style={[
          styles.shoeToe,
          large && styles.shoeToeLarge,
          { backgroundColor: palette.primary },
        ]}
      />
      <View
        style={[
          styles.shoeHeel,
          large && styles.shoeHeelLarge,
          { backgroundColor: palette.gold },
        ]}
      />
      <View style={[styles.shoeSwoosh, large && styles.shoeSwooshLarge]} />
      <View style={[styles.shoeSole, large && styles.shoeSoleLarge]} />
    </View>
  );
}

export function ProductCard({ product }: { product: ApiProduct }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);

  return (
    <View style={styles.productCard}>
      <Link href={`/product/${product.id}`} asChild>
        <Pressable style={styles.productLink}>
          <ProductVisual product={product} />
          <View style={styles.productMeta}>
            <View>
              <Text selectable style={styles.price}>
                {new Intl.NumberFormat('pt-BR', {
                  currency: 'BRL',
                  style: 'currency',
                }).format(product.preco)}
              </Text>
              <Text selectable style={styles.productName}>
                {product.nome}
              </Text>
            </View>
            <View style={styles.rating}>
              <Text selectable style={styles.ratingText}>
                {product.categoria}
              </Text>
            </View>
          </View>
        </Pressable>
      </Link>
      <Pressable
        accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        accessibilityRole="button"
        onPress={() => toggleFavorite(product.id)}
        style={[styles.favoriteBadge, favorite && styles.favoriteBadgeActive]}>
        <Ionicons
          name={favorite ? 'heart' : 'heart-outline'}
          size={16}
          color={favorite ? palette.primary : palette.muted}
        />
      </Pressable>
    </View>
  );
}

export function PrimaryButton({
  label,
  href,
  onPress,
}: {
  label: string;
  href?: Href;
  onPress?: () => void;
}) {
  const button = (
    <Pressable style={styles.primaryButton} onPress={onPress}>
      <Text selectable style={styles.primaryButtonText}>
        {label}
      </Text>
    </Pressable>
  );

  if (!href) {
    return button;
  }

  return (
    <Link href={href} asChild>
      {button}
    </Link>
  );
}

export function PriceRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.priceRow}>
      <Text selectable style={[styles.priceLabel, strong && styles.priceStrong]}>
        {label}
      </Text>
      <Text selectable style={[styles.priceValue, strong && styles.priceStrong]}>
        {value}
      </Text>
    </View>
  );
}

export function StepPill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <View style={[styles.stepPill, active && styles.stepPillActive]}>
      <Text selectable style={[styles.stepText, active && styles.stepTextActive]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 112,
    gap: 18,
  },
  headerBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  iconButtonActive: {
    backgroundColor: '#efe8ff',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionAction: {
    color: '#7aa8d8',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 12,
    height: 54,
    paddingHorizontal: 16,
  },
  searchInput: {
    color: palette.muted,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
  },
  visual: {
    backgroundColor: '#efe8ff',
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    height: '100%',
    width: '100%',
  },
  visualSmall: {
    borderRadius: 18,
    height: 116,
    width: '100%',
  },
  visualLarge: {
    borderRadius: 26,
    height: 220,
    width: '100%',
  },
  shoeUpper: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 46,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 20,
    height: 42,
    left: 24,
    position: 'absolute',
    top: 50,
    transform: [{ rotate: '-13deg' }],
    width: 88,
  },
  shoeUpperLarge: {
    height: 72,
    left: 58,
    top: 92,
    width: 158,
  },
  shoeToe: {
    borderRadius: 26,
    height: 36,
    left: 79,
    position: 'absolute',
    top: 61,
    transform: [{ rotate: '-8deg' }],
    width: 52,
  },
  shoeToeLarge: {
    height: 56,
    left: 158,
    top: 112,
    width: 92,
  },
  shoeHeel: {
    borderRadius: 12,
    height: 48,
    left: 24,
    position: 'absolute',
    top: 37,
    transform: [{ rotate: '-22deg' }],
    width: 25,
  },
  shoeHeelLarge: {
    borderRadius: 18,
    height: 82,
    left: 58,
    top: 66,
    width: 42,
  },
  shoeSwoosh: {
    backgroundColor: '#fff',
    borderRadius: 20,
    height: 8,
    left: 58,
    position: 'absolute',
    top: 68,
    transform: [{ rotate: '-22deg' }],
    width: 50,
  },
  shoeSwooshLarge: {
    height: 13,
    left: 115,
    top: 124,
    width: 90,
  },
  shoeSole: {
    backgroundColor: '#fdfdfd',
    borderRadius: 999,
    bottom: 24,
    height: 13,
    left: 22,
    position: 'absolute',
    transform: [{ rotate: '-6deg' }],
    width: 115,
  },
  shoeSoleLarge: {
    bottom: 48,
    height: 20,
    left: 54,
    width: 210,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    flex: 1,
    minWidth: 145,
    padding: 10,
  },
  productLink: {
    gap: 10,
  },
  favoriteBadge: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    height: 30,
    justifyContent: 'center',
    left: 14,
    position: 'absolute',
    top: 14,
    width: 30,
    zIndex: 2,
  },
  favoriteBadgeActive: {
    backgroundColor: '#efe8ff',
  },
  productMeta: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  price: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '900',
  },
  productName: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  rating: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
    paddingTop: 2,
  },
  ratingText: {
    color: palette.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 14,
    flex: 1,
    height: 56,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: '#ded2ff',
    fontSize: 13,
    fontWeight: '700',
  },
  priceValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  priceStrong: {
    color: '#fff',
    fontSize: 20,
  },
  stepPill: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    flex: 1,
    height: 36,
    justifyContent: 'center',
  },
  stepPillActive: {
    backgroundColor: '#efe8ff',
  },
  stepText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  stepTextActive: {
    color: palette.primary,
  },
});
