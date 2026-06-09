import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme';

export default function CategoriasScreen() {
  const [categorias, setCategorias] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('egreso');
  const [creando, setCreando] = useState(false);

  const cargarCategorias = async () => {
    try {
      setError(null);
      const data = await api.getCategorias();
      setCategorias(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarCategorias();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarCategorias();
    setRefreshing(false);
  };

  const crearCategoria = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'Ingresa un nombre para la categoría');
      return;
    }

    setCreando(true);
    try {
      const data = {
        nombre: nombre.trim(),
        tipo,
      };
      await api.crearCategoria(data);
      setNombre('');
      setTipo('egreso');
      setModalVisible(false);
      await cargarCategorias();
      Alert.alert('✅ Listo', `Categoría "${data.nombre}" creada`);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo crear la categoría');
    } finally {
      setCreando(false);
    }
  };

  const getCategoriaEmoji = (nombre, tipo) => {
    const emojis = {
      'Comida': '🍔',
      'Alquiler': '🏠',
      'Transporte': '🚗',
      'Servicios': '💡',
      'Entretenimiento': '🎬',
      'Salud': '🏥',
      'Salario': '💰',
      'Freelance': '💻',
      'Supermercado': '🛒',
      'Internet': '📡',
      'Agua': '💧',
      'Electricidad': '⚡',
      'Gas': '🔥',
    };
    return emojis[nombre] || (tipo === 'ingreso' ? '💵' : '💸');
  };

  const ingresos = categorias.filter((c) => c.tipo === 'ingreso');
  const egresos = categorias.filter((c) => c.tipo === 'egreso');

  const renderCategoriaItem = ({ item }) => (
    <View style={styles.categoriaCard}>
      <View style={styles.categoriaLeft}>
        <View
          style={[
            styles.categoriaIcon,
            {
              backgroundColor:
                item.tipo === 'ingreso' ? Colors.ingresoBg : Colors.egresoBg,
            },
          ]}
        >
          <Text style={styles.categoriaEmoji}>
            {getCategoriaEmoji(item.nombre, item.tipo)}
          </Text>
        </View>
        <View>
          <Text style={styles.categoriaName}>{item.nombre}</Text>
          <Text style={styles.categoriaTipo}>
            {item.tipo === 'ingreso' ? '📈 Ingreso' : '📉 Egreso'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Categorías</Text>
          <Text style={styles.subtitle}>
            {categorias.length} categoría{categorias.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.addBtnText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={[styles.errorBanner, { marginHorizontal: Spacing.lg }]}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      <FlatList
        data={[
          ...(egresos.length > 0 ? [{ type: 'header', title: 'Egresos', count: egresos.length }] : []),
          ...egresos.map((c) => ({ type: 'item', ...c })),
          ...(ingresos.length > 0 ? [{ type: 'header', title: 'Ingresos', count: ingresos.length }] : []),
          ...ingresos.map((c) => ({ type: 'item', ...c })),
        ]}
        keyExtractor={(item, index) =>
          item.type === 'header' ? `header-${item.title}` : `cat-${item.id}`
        }
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{item.title}</Text>
                <Text style={styles.sectionCount}>{item.count}</Text>
              </View>
            );
          }
          return renderCategoriaItem({ item });
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📁</Text>
            <Text style={styles.emptyTitle}>Sin categorías</Text>
            <Text style={styles.emptySubtitle}>
              Crea categorías para organizar tus transacciones
            </Text>
          </View>
        }
      />

      {/* Modal para crear categoría */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Nueva Categoría</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                style={styles.textInput}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej: Supermercado, Salario..."
                placeholderTextColor={Colors.textMuted}
                maxLength={30}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tipo</Text>
              <View style={styles.tipoToggle}>
                <TouchableOpacity
                  style={[
                    styles.tipoBtn,
                    tipo === 'egreso' && styles.tipoBtnActiveEgreso,
                  ]}
                  onPress={() => setTipo('egreso')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tipoBtnEmoji}>💸</Text>
                  <Text
                    style={[
                      styles.tipoBtnText,
                      tipo === 'egreso' && styles.tipoBtnTextActive,
                    ]}
                  >
                    Egreso
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tipoBtn,
                    tipo === 'ingreso' && styles.tipoBtnActiveIngreso,
                  ]}
                  onPress={() => setTipo('ingreso')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tipoBtnEmoji}>💵</Text>
                  <Text
                    style={[
                      styles.tipoBtnText,
                      tipo === 'ingreso' && styles.tipoBtnTextActive,
                    ]}
                  >
                    Ingreso
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setNombre('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createBtn,
                  creando && styles.createBtnDisabled,
                ]}
                onPress={crearCategoria}
                disabled={creando}
                activeOpacity={0.8}
              >
                {creando ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.createBtnText}>Crear</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  addBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  errorText: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionCount: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  categoriaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoriaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  categoriaIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriaEmoji: {
    fontSize: 20,
  },
  categoriaName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  categoriaTipo: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.textMuted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipoToggle: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tipoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  tipoBtnActiveEgreso: {
    backgroundColor: Colors.egresoBg,
    borderColor: Colors.egreso,
  },
  tipoBtnActiveIngreso: {
    backgroundColor: Colors.ingresoBg,
    borderColor: Colors.ingreso,
  },
  tipoBtnEmoji: {
    fontSize: 18,
  },
  tipoBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tipoBtnTextActive: {
    color: Colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  createBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  createBtnDisabled: {
    opacity: 0.6,
  },
  createBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
});
