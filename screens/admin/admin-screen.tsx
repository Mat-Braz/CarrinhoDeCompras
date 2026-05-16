import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { HeaderBar, Screen, palette } from '@/components/shop/shop-ui';
import {
  ApiCoupon,
  ApiProduct,
  createCoupon,
  createProduct,
  deleteCoupon,
  deleteProduct,
  getCoupons,
  getProducts,
  updateCoupon,
  updateProduct,
} from '@/services/shop-api';
import { useApiQuery } from '@/hooks/use-api-query';

type AdminTab = 'produtos' | 'cupons';

type ProductForm = {
  categoria: string;
  descricao: string;
  estoque: string;
  imagem: string;
  nome: string;
  preco: string;
};

type CouponForm = {
  ativo: boolean;
  codigo: string;
  descricao: string;
  tipo: ApiCoupon['tipo'];
  valor: string;
};

const blankProduct: ProductForm = {
  categoria: '',
  descricao: '',
  estoque: '',
  imagem: '',
  nome: '',
  preco: '',
};

const blankCoupon: CouponForm = {
  ativo: true,
  codigo: '',
  descricao: '',
  tipo: 'percentual',
  valor: '',
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

function productToForm(product: ApiProduct): ProductForm {
  return {
    categoria: product.categoria,
    descricao: product.descricao,
    estoque: String(product.estoque),
    imagem: product.imagem,
    nome: product.nome,
    preco: String(product.preco),
  };
}

function couponToForm(coupon: ApiCoupon): CouponForm {
  return {
    ativo: coupon.ativo,
    codigo: coupon.codigo,
    descricao: coupon.descricao,
    tipo: coupon.tipo,
    valor: String(coupon.valor),
  };
}

export default function AdminScreen() {
  const [tab, setTab] = React.useState<AdminTab>('produtos');
  const [productSearch, setProductSearch] = React.useState('');
  const [couponSearch, setCouponSearch] = React.useState('');
  const [editingProduct, setEditingProduct] = React.useState<ApiProduct | null>(null);
  const [editingCoupon, setEditingCoupon] = React.useState<ApiCoupon | null>(null);
  const [productModalVisible, setProductModalVisible] = React.useState(false);
  const [couponModalVisible, setCouponModalVisible] = React.useState(false);
  const [productForm, setProductForm] = React.useState<ProductForm>(blankProduct);
  const [couponForm, setCouponForm] = React.useState<CouponForm>(blankCoupon);
  const productsQuery = useApiQuery(() => getProducts(), 'admin-products');
  const couponsQuery = useApiQuery(() => getCoupons(), 'admin-coupons');

  const products = React.useMemo(
    () =>
      (productsQuery.data ?? []).filter((product) => {
        const search = productSearch.toLowerCase();
        return (
          product.nome.toLowerCase().includes(search) ||
          product.categoria.toLowerCase().includes(search)
        );
      }),
    [productSearch, productsQuery.data]
  );
  const coupons = React.useMemo(
    () =>
      (couponsQuery.data ?? []).filter((coupon) =>
        coupon.codigo.toLowerCase().includes(couponSearch.toLowerCase())
      ),
    [couponSearch, couponsQuery.data]
  );

  const openProductModal = (product?: ApiProduct) => {
    setEditingProduct(product ?? null);
    setProductForm(product ? productToForm(product) : blankProduct);
    setProductModalVisible(true);
  };

  const openCouponModal = (coupon?: ApiCoupon) => {
    setEditingCoupon(coupon ?? null);
    setCouponForm(coupon ? couponToForm(coupon) : blankCoupon);
    setCouponModalVisible(true);
  };

  const saveProduct = async () => {
    if (!productForm.nome.trim() || !productForm.preco.trim()) {
      Alert.alert('Erro', 'Nome e preco sao obrigatorios.');
      return;
    }

    const payload = {
      categoria: productForm.categoria.trim(),
      descricao: productForm.descricao.trim(),
      estoque: Number(productForm.estoque) || 0,
      imagem: productForm.imagem.trim(),
      nome: productForm.nome.trim(),
      preco: Number(productForm.preco.replace(',', '.')) || 0,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }

      setProductModalVisible(false);
      await productsQuery.refetch();
    } catch {
      Alert.alert('Erro', 'Nao foi possivel salvar o produto.');
    }
  };

  const saveCoupon = async () => {
    if (!couponForm.codigo.trim() || !couponForm.valor.trim()) {
      Alert.alert('Erro', 'Codigo e valor sao obrigatorios.');
      return;
    }

    const payload = {
      ativo: couponForm.ativo,
      codigo: couponForm.codigo.trim().toUpperCase(),
      descricao: couponForm.descricao.trim(),
      tipo: couponForm.tipo,
      valor: Number(couponForm.valor.replace(',', '.')) || 0,
    };

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
      } else {
        await createCoupon(payload);
      }

      setCouponModalVisible(false);
      await couponsQuery.refetch();
    } catch {
      Alert.alert('Erro', 'Nao foi possivel salvar o cupom.');
    }
  };

  const confirmDeleteProduct = (product: ApiProduct) => {
    Alert.alert('Excluir produto', `Deseja excluir ${product.nome}?`, [
      { style: 'cancel', text: 'Cancelar' },
      {
        onPress: async () => {
          await deleteProduct(product.id);
          await productsQuery.refetch();
        },
        style: 'destructive',
        text: 'Excluir',
      },
    ]);
  };

  const confirmDeleteCoupon = (coupon: ApiCoupon) => {
    Alert.alert('Excluir cupom', `Deseja excluir ${coupon.codigo}?`, [
      { style: 'cancel', text: 'Cancelar' },
      {
        onPress: async () => {
          await deleteCoupon(coupon.id);
          await couponsQuery.refetch();
        },
        style: 'destructive',
        text: 'Excluir',
      },
    ]);
  };

  return (
    <Screen>
      <HeaderBar title="Painel admin" />

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text selectable style={styles.statValue}>
            {productsQuery.data?.length ?? 0}
          </Text>
          <Text selectable style={styles.statLabel}>
            Produtos
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text selectable style={styles.statValue}>
            {couponsQuery.data?.length ?? 0}
          </Text>
          <Text selectable style={styles.statLabel}>
            Cupons
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text selectable style={styles.statValue}>
            {(productsQuery.data ?? []).reduce((total, product) => total + product.estoque, 0)}
          </Text>
          <Text selectable style={styles.statLabel}>
            Estoque
          </Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab('produtos')}
          style={[styles.tab, tab === 'produtos' && styles.tabActive]}>
          <Text selectable style={[styles.tabText, tab === 'produtos' && styles.tabTextActive]}>
            Produtos
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('cupons')}
          style={[styles.tab, tab === 'cupons' && styles.tabActive]}>
          <Text selectable style={[styles.tabText, tab === 'cupons' && styles.tabTextActive]}>
            Cupons
          </Text>
        </Pressable>
      </View>

      {tab === 'produtos' ? (
        <>
          <Toolbar
            buttonLabel="Novo"
            onAdd={() => openProductModal()}
            onSearch={setProductSearch}
            placeholder="Buscar produto ou categoria"
            value={productSearch}
          />
          {products.map((product) => (
            <View key={product.id} style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="cube-outline" size={24} color={palette.primary} />
              </View>
              <View style={styles.cardBody}>
                <Text selectable style={styles.cardTitle}>
                  {product.nome}
                </Text>
                <Text selectable style={styles.cardSub}>
                  {product.descricao || 'Sem descricao'}
                </Text>
                <Text selectable style={styles.cardMeta}>
                  {product.categoria} - {product.estoque} em estoque
                </Text>
                <Text selectable style={styles.cardPrice}>
                  {currencyFormatter.format(product.preco)}
                </Text>
              </View>
              <Actions onDelete={() => confirmDeleteProduct(product)} onEdit={() => openProductModal(product)} />
            </View>
          ))}
        </>
      ) : (
        <>
          <Toolbar
            buttonLabel="Novo"
            onAdd={() => openCouponModal()}
            onSearch={setCouponSearch}
            placeholder="Buscar cupom"
            value={couponSearch}
          />
          {coupons.map((coupon) => (
            <View key={coupon.id} style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="ticket-outline" size={24} color={palette.primary} />
              </View>
              <View style={styles.cardBody}>
                <Text selectable style={styles.cardTitle}>
                  {coupon.codigo}
                </Text>
                <Text selectable style={styles.cardSub}>
                  {coupon.descricao || 'Sem descricao'}
                </Text>
                <Text selectable style={styles.cardMeta}>
                  {coupon.tipo === 'percentual' ? `${coupon.valor}%` : currencyFormatter.format(coupon.valor)}
                </Text>
                <Text selectable style={styles.cardStatus}>
                  {coupon.ativo ? 'Ativo' : 'Inativo'}
                </Text>
              </View>
              <Actions onDelete={() => confirmDeleteCoupon(coupon)} onEdit={() => openCouponModal(coupon)} />
            </View>
          ))}
        </>
      )}

      <ProductModal
        form={productForm}
        onChange={setProductForm}
        onClose={() => setProductModalVisible(false)}
        onSave={saveProduct}
        title={editingProduct ? 'Editar produto' : 'Novo produto'}
        visible={productModalVisible}
      />
      <CouponModal
        form={couponForm}
        onChange={setCouponForm}
        onClose={() => setCouponModalVisible(false)}
        onSave={saveCoupon}
        title={editingCoupon ? 'Editar cupom' : 'Novo cupom'}
        visible={couponModalVisible}
      />
    </Screen>
  );
}

function Toolbar({
  buttonLabel,
  onAdd,
  onSearch,
  placeholder,
  value,
}: {
  buttonLabel: string;
  onAdd: () => void;
  onSearch: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.toolbar}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={palette.muted} />
        <TextInput
          onChangeText={onSearch}
          placeholder={placeholder}
          placeholderTextColor={palette.muted}
          style={styles.searchInput}
          value={value}
        />
      </View>
      <Pressable onPress={onAdd} style={styles.addButton}>
        <Ionicons name="add" size={18} color="#fff" />
        <Text selectable style={styles.addButtonText}>
          {buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function Actions({ onDelete, onEdit }: { onDelete: () => void; onEdit: () => void }) {
  return (
    <View style={styles.actions}>
      <Pressable onPress={onEdit} style={styles.actionButton}>
        <Ionicons name="create-outline" size={18} color={palette.primary} />
      </Pressable>
      <Pressable onPress={onDelete} style={[styles.actionButton, styles.deleteButton]}>
        <Ionicons name="trash-outline" size={18} color="#d13b3b" />
      </Pressable>
    </View>
  );
}

function ProductModal({
  form,
  onChange,
  onClose,
  onSave,
  title,
  visible,
}: {
  form: ProductForm;
  onChange: (form: ProductForm) => void;
  onClose: () => void;
  onSave: () => void;
  title: string;
  visible: boolean;
}) {
  return (
    <AdminModal onClose={onClose} onSave={onSave} title={title} visible={visible}>
      <AdminInput label="Nome" onChangeText={(nome) => onChange({ ...form, nome })} value={form.nome} />
      <AdminInput
        label="Descricao"
        onChangeText={(descricao) => onChange({ ...form, descricao })}
        value={form.descricao}
      />
      <AdminInput
        label="Categoria"
        onChangeText={(categoria) => onChange({ ...form, categoria })}
        value={form.categoria}
      />
      <AdminInput
        keyboardType="decimal-pad"
        label="Preco"
        onChangeText={(preco) => onChange({ ...form, preco })}
        value={form.preco}
      />
      <AdminInput
        keyboardType="number-pad"
        label="Estoque"
        onChangeText={(estoque) => onChange({ ...form, estoque })}
        value={form.estoque}
      />
      <AdminInput
        label="URL da imagem"
        onChangeText={(imagem) => onChange({ ...form, imagem })}
        value={form.imagem}
      />
    </AdminModal>
  );
}

function CouponModal({
  form,
  onChange,
  onClose,
  onSave,
  title,
  visible,
}: {
  form: CouponForm;
  onChange: (form: CouponForm) => void;
  onClose: () => void;
  onSave: () => void;
  title: string;
  visible: boolean;
}) {
  return (
    <AdminModal onClose={onClose} onSave={onSave} title={title} visible={visible}>
      <AdminInput
        label="Codigo"
        onChangeText={(codigo) => onChange({ ...form, codigo: codigo.toUpperCase() })}
        value={form.codigo}
      />
      <AdminInput
        label="Descricao"
        onChangeText={(descricao) => onChange({ ...form, descricao })}
        value={form.descricao}
      />
      <View style={styles.segmented}>
        <Pressable
          onPress={() => onChange({ ...form, tipo: 'percentual' })}
          style={[styles.segment, form.tipo === 'percentual' && styles.segmentActive]}>
          <Text
            selectable
            style={[styles.segmentText, form.tipo === 'percentual' && styles.segmentTextActive]}>
            Percentual
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onChange({ ...form, tipo: 'valor' })}
          style={[styles.segment, form.tipo === 'valor' && styles.segmentActive]}>
          <Text selectable style={[styles.segmentText, form.tipo === 'valor' && styles.segmentTextActive]}>
            Valor
          </Text>
        </Pressable>
      </View>
      <AdminInput
        keyboardType="decimal-pad"
        label={form.tipo === 'percentual' ? 'Valor em %' : 'Valor em R$'}
        onChangeText={(valor) => onChange({ ...form, valor })}
        value={form.valor}
      />
      <Pressable onPress={() => onChange({ ...form, ativo: !form.ativo })} style={styles.switchRow}>
        <Ionicons
          name={form.ativo ? 'checkbox' : 'square-outline'}
          size={22}
          color={form.ativo ? palette.primary : palette.muted}
        />
        <Text selectable style={styles.switchText}>
          Cupom ativo
        </Text>
      </Pressable>
    </AdminModal>
  );
}

function AdminModal({
  children,
  onClose,
  onSave,
  title,
  visible,
}: {
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
  title: string;
  visible: boolean;
}) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet" visible={visible}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose}>
            <Text selectable style={styles.modalCancel}>
              Cancelar
            </Text>
          </Pressable>
          <Text selectable style={styles.modalTitle}>
            {title}
          </Text>
          <Pressable onPress={onSave}>
            <Text selectable style={styles.modalSave}>
              Salvar
            </Text>
          </Pressable>
        </View>
        <View style={styles.modalBody}>{children}</View>
      </View>
    </Modal>
  );
}

function AdminInput({
  keyboardType = 'default',
  label,
  onChangeText,
  value,
}: {
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text selectable style={styles.inputLabel}>
        {label}
      </Text>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholderTextColor={palette.muted}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stats: {
    backgroundColor: palette.primary,
    borderRadius: 20,
    flexDirection: 'row',
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    color: '#e6d9ff',
    fontSize: 12,
    fontWeight: '800',
  },
  tabs: {
    backgroundColor: '#e7e7ee',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 4,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '900',
  },
  tabTextActive: {
    color: palette.primary,
  },
  toolbar: {
    flexDirection: 'row',
    gap: 10,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: palette.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    padding: 0,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 6,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  cardIcon: {
    alignItems: 'center',
    backgroundColor: '#efe8ff',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '900',
  },
  cardSub: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  cardMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  cardPrice: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  cardStatus: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  actions: {
    gap: 8,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#efe8ff',
    borderRadius: 10,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  deleteButton: {
    backgroundColor: '#ffe8e8',
  },
  modal: {
    backgroundColor: '#fff',
    flex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: '#ececf2',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalCancel: {
    color: palette.muted,
    fontSize: 15,
    fontWeight: '800',
  },
  modalSave: {
    color: palette.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  modalTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '900',
  },
  modalBody: {
    gap: 16,
    padding: 20,
  },
  inputGroup: {
    gap: 7,
  },
  inputLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  input: {
    backgroundColor: '#f6f6f8',
    borderRadius: 12,
    color: palette.text,
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  segmented: {
    backgroundColor: '#f0f0f5',
    borderRadius: 14,
    flexDirection: 'row',
    padding: 4,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    paddingVertical: 10,
  },
  segmentActive: {
    backgroundColor: palette.primary,
  },
  segmentText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  segmentTextActive: {
    color: '#fff',
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  switchText: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '800',
  },
});
