import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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

type ProductFormErrors = Partial<Record<keyof ProductForm, string>>;

type CouponForm = {
  ativo: boolean;
  codigo: string;
  descricao: string;
  tipo: ApiCoupon['tipo'];
  valor: string;
};

type CouponFormErrors = Partial<Record<keyof CouponForm, string>>;

type DeleteTarget =
  | { id: string; kind: 'coupon'; label: string }
  | { id: string; kind: 'product'; label: string };

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

function parsePositiveNumber(value: string) {
  return Number(value.replace(',', '.'));
}

function validateProductForm(form: ProductForm) {
  const errors: ProductFormErrors = {};
  const price = parsePositiveNumber(form.preco);
  const stock = Number(form.estoque);

  if (!form.nome.trim()) {
    errors.nome = 'Informe o nome do produto.';
  }

  if (!form.descricao.trim()) {
    errors.descricao = 'Informe a descricao do produto.';
  }

  if (!form.categoria.trim()) {
    errors.categoria = 'Informe a categoria do produto.';
  }

  if (!form.preco.trim()) {
    errors.preco = 'Informe o preco do produto.';
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.preco = 'Informe um preco maior que zero.';
  }

  if (!form.estoque.trim()) {
    errors.estoque = 'Informe a quantidade em estoque.';
  } else if (!Number.isInteger(stock) || stock < 0) {
    errors.estoque = 'Informe um estoque inteiro igual ou maior que zero.';
  }

  if (!form.imagem.trim()) {
    errors.imagem = 'Selecione uma imagem local do produto.';
  }

  return errors;
}

function validateCouponForm(form: CouponForm) {
  const errors: CouponFormErrors = {};
  const value = parsePositiveNumber(form.valor);

  if (!form.codigo.trim()) {
    errors.codigo = 'Informe o codigo do cupom.';
  } else if (form.codigo.trim().length < 3) {
    errors.codigo = 'O codigo deve ter pelo menos 3 caracteres.';
  }

  if (!form.descricao.trim()) {
    errors.descricao = 'Informe a descricao do cupom.';
  }

  if (!form.tipo) {
    errors.tipo = 'Selecione o tipo do desconto.';
  }

  if (!form.valor.trim()) {
    errors.valor = 'Informe o valor do desconto.';
  } else if (!Number.isFinite(value) || value <= 0) {
    errors.valor = 'Informe um valor maior que zero.';
  } else if (form.tipo === 'percentual' && value > 100) {
    errors.valor = 'O percentual deve ser no maximo 100.';
  }

  return errors;
}

function productFormChanged(form: ProductForm, product: ApiProduct) {
  return (
    form.nome.trim() !== product.nome ||
    form.descricao.trim() !== product.descricao ||
    form.categoria.trim() !== product.categoria ||
    parsePositiveNumber(form.preco) !== product.preco ||
    Number(form.estoque) !== product.estoque ||
    form.imagem.trim() !== product.imagem
  );
}

function couponFormChanged(form: CouponForm, coupon: ApiCoupon) {
  return (
    form.codigo.trim().toUpperCase() !== coupon.codigo ||
    form.descricao.trim() !== coupon.descricao ||
    form.tipo !== coupon.tipo ||
    parsePositiveNumber(form.valor) !== coupon.valor ||
    form.ativo !== coupon.ativo
  );
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
  const [productErrors, setProductErrors] = React.useState<ProductFormErrors>({});
  const [productFormError, setProductFormError] = React.useState('');
  const [productSuccessMessage, setProductSuccessMessage] = React.useState('');
  const [couponForm, setCouponForm] = React.useState<CouponForm>(blankCoupon);
  const [couponErrors, setCouponErrors] = React.useState<CouponFormErrors>({});
  const [couponFormError, setCouponFormError] = React.useState('');
  const [couponSuccessMessage, setCouponSuccessMessage] = React.useState('');
  const [deleteTarget, setDeleteTarget] = React.useState<DeleteTarget | null>(null);
  const productsQuery = useApiQuery(() => getProducts(), 'admin-products');
  const couponsQuery = useApiQuery(() => getCoupons(), 'admin-coupons');

  React.useEffect(() => {
    if (!productSuccessMessage) {
      return undefined;
    }

    const timer = setTimeout(() => setProductSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [productSuccessMessage]);

  React.useEffect(() => {
    if (!couponSuccessMessage) {
      return undefined;
    }

    const timer = setTimeout(() => setCouponSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [couponSuccessMessage]);

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
    setProductErrors({});
    setProductFormError('');
    setProductSuccessMessage('');
    setProductModalVisible(true);
  };

  const openCouponModal = (coupon?: ApiCoupon) => {
    setEditingCoupon(coupon ?? null);
    setCouponForm(coupon ? couponToForm(coupon) : blankCoupon);
    setCouponErrors({});
    setCouponFormError('');
    setCouponSuccessMessage('');
    setCouponModalVisible(true);
  };

  const updateProductField = (field: keyof ProductForm, value: string) => {
    setProductForm((current) => ({ ...current, [field]: value }));
    setProductFormError('');
    setProductErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const pickProductImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      base64: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (!result.canceled) {
      updateProductField('imagem', result.assets[0].uri);
    }
  };

  const updateCouponField = <Field extends keyof CouponForm>(
    field: Field,
    value: CouponForm[Field]
  ) => {
    setCouponForm((current) => ({ ...current, [field]: value }));
    setCouponFormError('');
    setCouponErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const saveProduct = async () => {
    const errors = validateProductForm(productForm);
    setProductErrors(errors);
    setProductFormError('');
    setProductSuccessMessage('');

    if (Object.keys(errors).length) {
      return;
    }

    const isEditing = Boolean(editingProduct);
    if (editingProduct && !productFormChanged(productForm, editingProduct)) {
      setProductFormError('Altere pelo menos um campo para salvar.');
      return;
    }

    const payload = {
      categoria: productForm.categoria.trim(),
      descricao: productForm.descricao.trim(),
      estoque: Number(productForm.estoque),
      imagem: productForm.imagem.trim(),
      nome: productForm.nome.trim(),
      preco: parsePositiveNumber(productForm.preco),
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }

      setProductModalVisible(false);
      setProductSuccessMessage(
        isEditing ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.'
      );
      await productsQuery.refetch();
    } catch {
      Alert.alert('Erro', 'Nao foi possivel salvar o produto.');
    }
  };

  const saveCoupon = async () => {
    const errors = validateCouponForm(couponForm);
    setCouponErrors(errors);
    setCouponFormError('');
    setCouponSuccessMessage('');

    if (Object.keys(errors).length) {
      return;
    }

    const isEditing = Boolean(editingCoupon);
    if (editingCoupon && !couponFormChanged(couponForm, editingCoupon)) {
      setCouponFormError('Altere pelo menos um campo para salvar.');
      return;
    }

    const payload = {
      ativo: editingCoupon ? couponForm.ativo : true,
      codigo: couponForm.codigo.trim().toUpperCase(),
      descricao: couponForm.descricao.trim(),
      tipo: couponForm.tipo,
      valor: parsePositiveNumber(couponForm.valor),
    };

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
      } else {
        await createCoupon(payload);
      }

      setCouponModalVisible(false);
      setCouponSuccessMessage(
        isEditing ? 'Cupom atualizado com sucesso.' : 'Cupom cadastrado com sucesso.'
      );
      await couponsQuery.refetch();
    } catch {
      Alert.alert('Erro', 'Nao foi possivel salvar o cupom.');
    }
  };

  const confirmDeleteProduct = (product: ApiProduct) => {
    setProductSuccessMessage('');
    setDeleteTarget({ id: product.id, kind: 'product', label: product.nome });
  };

  const confirmDeleteCoupon = (coupon: ApiCoupon) => {
    setCouponSuccessMessage('');
    setDeleteTarget({ id: coupon.id, kind: 'coupon', label: coupon.codigo });
  };

  const deleteSelectedItem = async () => {
    if (!deleteTarget) {
      return;
    }

    const target = deleteTarget;
    setDeleteTarget(null);

    try {
      if (target.kind === 'product') {
        await deleteProduct(target.id);
        setProductSuccessMessage('Produto excluido com sucesso.');
        await productsQuery.refetch();
      } else {
        await deleteCoupon(target.id);
        setCouponSuccessMessage('Cupom excluido com sucesso.');
        await couponsQuery.refetch();
      }
    } catch {
      Alert.alert('Erro', target.kind === 'product' ? 'Nao foi possivel excluir o produto.' : 'Nao foi possivel excluir o cupom.');
    }
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
          {productSuccessMessage ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#1f8f4d" />
              <Text selectable style={styles.successText}>
                {productSuccessMessage}
              </Text>
            </View>
          ) : null}
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
          {couponSuccessMessage ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#1f8f4d" />
              <Text selectable style={styles.successText}>
                {couponSuccessMessage}
              </Text>
            </View>
          ) : null}
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
        errors={productErrors}
        form={productForm}
        formError={productFormError}
        onChange={updateProductField}
        onClose={() => setProductModalVisible(false)}
        onPickImage={pickProductImage}
        onSave={saveProduct}
        title={editingProduct ? 'Editar produto' : 'Novo produto'}
        visible={productModalVisible}
      />
      <CouponModal
        errors={couponErrors}
        form={couponForm}
        formError={couponFormError}
        isEditing={Boolean(editingCoupon)}
        onChange={updateCouponField}
        onClose={() => setCouponModalVisible(false)}
        onSave={saveCoupon}
        title={editingCoupon ? 'Editar cupom' : 'Novo cupom'}
        visible={couponModalVisible}
      />
      <DeleteConfirmModal
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteSelectedItem}
        target={deleteTarget}
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
  errors,
  form,
  formError,
  onChange,
  onClose,
  onPickImage,
  onSave,
  title,
  visible,
}: {
  errors: ProductFormErrors;
  form: ProductForm;
  formError: string;
  onChange: (field: keyof ProductForm, value: string) => void;
  onClose: () => void;
  onPickImage: () => void;
  onSave: () => void;
  title: string;
  visible: boolean;
}) {
  return (
    <AdminModal onClose={onClose} onSave={onSave} title={title} visible={visible}>
      <AdminInput
        error={errors.nome}
        label="Nome"
        onChangeText={(nome) => onChange('nome', nome)}
        value={form.nome}
      />
      <AdminInput
        error={errors.descricao}
        label="Descricao"
        onChangeText={(descricao) => onChange('descricao', descricao)}
        value={form.descricao}
      />
      <AdminInput
        error={errors.categoria}
        label="Categoria"
        onChangeText={(categoria) => onChange('categoria', categoria)}
        value={form.categoria}
      />
      <AdminInput
        error={errors.preco}
        keyboardType="decimal-pad"
        label="Preco"
        onChangeText={(preco) => onChange('preco', preco)}
        value={form.preco}
      />
      <AdminInput
        error={errors.estoque}
        keyboardType="number-pad"
        label="Estoque"
        onChangeText={(estoque) => onChange('estoque', estoque)}
        value={form.estoque}
      />
      <View style={styles.inputGroup}>
        <Text selectable style={styles.inputLabel}>
          Imagem
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onPickImage}
          style={[styles.uploadBox, errors.imagem && styles.inputError]}>
          {form.imagem ? (
            <Image source={{ uri: form.imagem }} style={styles.uploadPreview} />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={28} color={palette.primary} />
              <Text selectable style={styles.uploadText}>
                Selecionar arquivo local
              </Text>
            </>
          )}
        </Pressable>
        {errors.imagem ? (
          <Text selectable style={styles.errorText}>
            {errors.imagem}
          </Text>
        ) : null}
      </View>
      {formError ? (
        <Text selectable style={styles.errorText}>
          {formError}
        </Text>
      ) : null}
    </AdminModal>
  );
}

function CouponModal({
  errors,
  form,
  formError,
  isEditing,
  onChange,
  onClose,
  onSave,
  title,
  visible,
}: {
  errors: CouponFormErrors;
  form: CouponForm;
  formError: string;
  isEditing: boolean;
  onChange: <Field extends keyof CouponForm>(field: Field, value: CouponForm[Field]) => void;
  onClose: () => void;
  onSave: () => void;
  title: string;
  visible: boolean;
}) {
  return (
    <AdminModal onClose={onClose} onSave={onSave} title={title} visible={visible}>
      <AdminInput
        error={errors.codigo}
        label="Codigo"
        onChangeText={(codigo) => onChange('codigo', codigo.toUpperCase())}
        value={form.codigo}
      />
      <AdminInput
        error={errors.descricao}
        label="Descricao"
        onChangeText={(descricao) => onChange('descricao', descricao)}
        value={form.descricao}
      />
      <View style={styles.inputGroup}>
        <Text selectable style={styles.inputLabel}>
          Tipo
        </Text>
        <View style={[styles.segmented, errors.tipo && styles.inputError]}>
          <Pressable
            onPress={() => onChange('tipo', 'percentual')}
            style={[styles.segment, form.tipo === 'percentual' && styles.segmentActive]}>
            <Text
              selectable
              style={[styles.segmentText, form.tipo === 'percentual' && styles.segmentTextActive]}>
              Percentual
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onChange('tipo', 'valor')}
            style={[styles.segment, form.tipo === 'valor' && styles.segmentActive]}>
            <Text selectable style={[styles.segmentText, form.tipo === 'valor' && styles.segmentTextActive]}>
              Valor
            </Text>
          </Pressable>
        </View>
        {errors.tipo ? (
          <Text selectable style={styles.errorText}>
            {errors.tipo}
          </Text>
        ) : null}
      </View>
      <AdminInput
        error={errors.valor}
        keyboardType="decimal-pad"
        label={form.tipo === 'percentual' ? 'Valor em %' : 'Valor em R$'}
        onChangeText={(valor) => onChange('valor', valor)}
        value={form.valor}
      />
      {isEditing ? (
        <Pressable onPress={() => onChange('ativo', !form.ativo)} style={styles.switchRow}>
          <Ionicons
            name={form.ativo ? 'checkbox' : 'square-outline'}
            size={22}
            color={form.ativo ? palette.primary : palette.muted}
          />
          <Text selectable style={styles.switchText}>
            Cupom ativo
          </Text>
        </Pressable>
      ) : null}
      {formError ? (
        <Text selectable style={styles.errorText}>
          {formError}
        </Text>
      ) : null}
    </AdminModal>
  );
}

function DeleteConfirmModal({
  onCancel,
  onConfirm,
  target,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  target: DeleteTarget | null;
}) {
  const itemLabel = target?.kind === 'product' ? 'produto' : 'cupom';

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={Boolean(target)}>
      <View style={styles.confirmBackdrop}>
        <View style={styles.confirmBox}>
          <View style={styles.confirmIcon}>
            <Ionicons name="trash-outline" size={26} color="#d13b3b" />
          </View>
          <Text selectable style={styles.confirmTitle}>
            Excluir {itemLabel}
          </Text>
          <Text selectable style={styles.confirmMessage}>
            Deseja excluir {target?.label}?
          </Text>
          <View style={styles.confirmActions}>
            <Pressable onPress={onCancel} style={[styles.confirmButton, styles.confirmCancelButton]}>
              <Text selectable style={styles.confirmCancelText}>
                Nao
              </Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={[styles.confirmButton, styles.confirmDeleteAction]}>
              <Text selectable style={styles.confirmDeleteText}>
                Excluir
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
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
  error,
  keyboardType = 'default',
  label,
  onChangeText,
  value,
}: {
  error?: string;
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
        style={[styles.input, error && styles.inputError]}
        value={value}
      />
      {error ? (
        <Text selectable style={styles.errorText}>
          {error}
        </Text>
      ) : null}
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
  successBanner: {
    alignItems: 'center',
    backgroundColor: '#eaf8ef',
    borderColor: '#bde8cc',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  successText: {
    color: '#1f8f4d',
    flex: 1,
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
    borderColor: '#f6f6f8',
    borderWidth: 1,
    color: palette.text,
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: '#d13b3b',
  },
  errorText: {
    color: '#d13b3b',
    fontSize: 12,
    fontWeight: '800',
  },
  uploadBox: {
    alignItems: 'center',
    backgroundColor: '#f6f6f8',
    borderColor: '#f6f6f8',
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    minHeight: 130,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadPreview: {
    height: 160,
    resizeMode: 'cover',
    width: '100%',
  },
  uploadText: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: '900',
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
  confirmBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 17, 24, 0.42)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  confirmBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    gap: 12,
    padding: 20,
    width: '100%',
  },
  confirmIcon: {
    alignItems: 'center',
    backgroundColor: '#ffe8e8',
    borderRadius: 18,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  confirmTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '900',
  },
  confirmMessage: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    width: '100%',
  },
  confirmButton: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  confirmCancelButton: {
    backgroundColor: '#f0f0f5',
  },
  confirmDeleteAction: {
    backgroundColor: '#d13b3b',
  },
  confirmCancelText: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '900',
  },
  confirmDeleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
});
