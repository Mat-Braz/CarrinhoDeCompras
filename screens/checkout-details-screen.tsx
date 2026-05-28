import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  HeaderBar,
  PriceRow,
  PrimaryButton,
  ProductVisual,
  Screen,
  StepPill,
  palette,
} from '@/components/shop/shop-ui';
import { useCart } from '@/hooks/use-cart';
import { CheckoutAddress } from '@/services/shop-api';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

const defaultAddress: CheckoutAddress = {
  bairro: 'Centro',
  cidade: 'Sao Paulo',
  complemento: '',
  endereco: '3517 W. Gray St.',
  numero: '57867',
  uf: 'SP',
};

function getAddressFromParams(params: { [key: string]: string | string[] | undefined }) {
  return {
    bairro: typeof params.bairro === 'string' ? params.bairro : defaultAddress.bairro,
    cidade: typeof params.cidade === 'string' ? params.cidade : defaultAddress.cidade,
    complemento:
      typeof params.complemento === 'string' ? params.complemento : defaultAddress.complemento,
    endereco: typeof params.endereco === 'string' ? params.endereco : defaultAddress.endereco,
    numero: typeof params.numero === 'string' ? params.numero : defaultAddress.numero,
    uf: typeof params.uf === 'string' ? params.uf : defaultAddress.uf,
  };
}

export default function CheckoutDetailsScreen() {
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
  const [editingAddress, setEditingAddress] = React.useState(false);
  const [address, setAddress] = React.useState<CheckoutAddress>(() => getAddressFromParams(params));
  const { data: cart } = useCart(couponCode);
  const items = cart?.itens ?? [];
  const shippingParams = {
    bairro: address.bairro,
    cidade: address.cidade,
    complemento: address.complemento,
    endereco: address.endereco,
    numero: address.numero,
    uf: address.uf,
    ...(couponCode && cart?.cupomAplicado ? { cupom: couponCode } : {}),
  };

  return (
    <Screen>
      <HeaderBar title="Detalhes do pedido" />
      <View style={styles.steps}>
        <StepPill label="Detalhes" active />
        <StepPill label="Entrega" />
        <StepPill label="Pagamento" />
      </View>

      <View style={styles.card}>
        <Text selectable style={styles.cardTitle}>
          Produtos
        </Text>
        {items.map((item) => (
          <View key={item.id} style={styles.productRow}>
            <View style={styles.thumb}>
              <ProductVisual product={item.produto} />
            </View>
            <View style={styles.productInfo}>
              <Text selectable style={styles.productName}>
                {item.produto.nome}
              </Text>
              <Text selectable style={styles.productMeta}>
                Qtd. {item.quantidade}
              </Text>
            </View>
            <Text selectable style={styles.productPrice}>
              {currencyFormatter.format(item.total)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text selectable style={styles.cardTitle}>
          Endereco de entrega
        </Text>
        <View style={styles.addressRow}>
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={18} color={palette.primary} />
          </View>
          {editingAddress ? (
            <View style={styles.addressFields}>
              <TextInput
                onChangeText={(endereco) => setAddress((current) => ({ ...current, endereco }))}
                placeholder="Endereco"
                placeholderTextColor={palette.muted}
                style={styles.input}
                value={address.endereco}
              />
              <View style={styles.inputRow}>
                <TextInput
                  onChangeText={(numero) => setAddress((current) => ({ ...current, numero }))}
                  placeholder="Numero"
                  placeholderTextColor={palette.muted}
                  style={[styles.input, styles.inputSmall]}
                  value={address.numero}
                />
                <TextInput
                  onChangeText={(bairro) => setAddress((current) => ({ ...current, bairro }))}
                  placeholder="Bairro"
                  placeholderTextColor={palette.muted}
                  style={[styles.input, styles.inputFlex]}
                  value={address.bairro}
                />
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  onChangeText={(cidade) => setAddress((current) => ({ ...current, cidade }))}
                  placeholder="Cidade"
                  placeholderTextColor={palette.muted}
                  style={[styles.input, styles.inputFlex]}
                  value={address.cidade}
                />
                <TextInput
                  autoCapitalize="characters"
                  maxLength={2}
                  onChangeText={(uf) =>
                    setAddress((current) => ({ ...current, uf: uf.toUpperCase() }))
                  }
                  placeholder="UF"
                  placeholderTextColor={palette.muted}
                  style={[styles.input, styles.inputUf]}
                  value={address.uf}
                />
              </View>
              <TextInput
                onChangeText={(complemento) =>
                  setAddress((current) => ({ ...current, complemento }))
                }
                placeholder="Complemento"
                placeholderTextColor={palette.muted}
                style={styles.input}
                value={address.complemento}
              />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Text selectable style={styles.addressTitle}>
                {address.endereco}, {address.numero}
              </Text>
              <Text selectable style={styles.productMeta}>
                {address.bairro} - {address.cidade}, {address.uf}
              </Text>
            </View>
          )}
          <Pressable onPress={() => setEditingAddress((current) => !current)}>
            <Text selectable style={styles.change}>
              {editingAddress ? 'Salvar' : 'Alterar'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.summary}>
        <PriceRow label="Subtotal" value={currencyFormatter.format(cart?.subtotal ?? 0)} />
        <PriceRow label="Entrega" value={currencyFormatter.format(cart?.frete ?? 0)} />
        <PriceRow label="Desconto" value={`-${currencyFormatter.format(cart?.desconto ?? 0)}`} />
        <View style={styles.divider} />
        <PriceRow label="Total" value={currencyFormatter.format(cart?.total ?? 0)} strong />
      </View>
      <PrimaryButton
        label="Continuar para entrega"
        href={{
          pathname: '/shipping',
          params: shippingParams,
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  steps: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    gap: 14,
    padding: 16,
  },
  cardTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '900',
  },
  productRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  thumb: {
    width: 64,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '900',
  },
  productMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  productPrice: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '900',
  },
  addressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  addressFields: {
    flex: 1,
    gap: 8,
  },
  input: {
    backgroundColor: '#f6f6f8',
    borderRadius: 12,
    color: palette.text,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inputSmall: {
    width: 86,
  },
  inputFlex: {
    flex: 1,
  },
  inputUf: {
    width: 64,
  },
  locationIcon: {
    alignItems: 'center',
    backgroundColor: '#efe8ff',
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  addressTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '900',
  },
  change: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  summary: {
    backgroundColor: palette.primary,
    borderRadius: 24,
    gap: 15,
    padding: 20,
  },
  divider: {
    borderColor: '#a982ef',
    borderStyle: 'dashed',
    borderTopWidth: 1,
  },
});
