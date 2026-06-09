import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { api } from '../services/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme';

export default function NuevaTransaccionScreen({ navigation }) {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [tipoFiltro, setTipoFiltro] = useState('egreso');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const data = await api.getCategorias();
      setCategorias(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipoFiltro);

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

  const registrarTransaccion = async () => {
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido mayor a 0');
      return;
    }
    if (!categoriaSeleccionada) {
      Alert.alert('Error', 'Selecciona una categoría');
      return;
    }

    setCargando(true);
    try {
      const data = {
        monto: montoNum,
        descripcion: descripcion.trim() || undefined,
        categoria_id: categoriaSeleccionada,
      };
      await api.crearTransaccion(data);
      Alert.alert('✅ Listo', 'Transacción registrada con éxito', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo registrar la transacción');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Nueva Transacción</Text>
            <Text style={styles.subtitle}>Registra un ingreso o egreso</Text>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Tipo Toggle */}
          <View style={styles.tipoToggle}>
            <TouchableOpacity
              style={[
                styles.tipoBtn,
                tipoFiltro === 'egreso' && styles.tipoBtnActiveEgreso,
              ]}
              onPress={() => {
                setTipoFiltro('egreso');
                setCategoriaSeleccionada(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.tipoBtnIcon}>💸</Text>
              <Text
                style={[
                  styles.tipoBtnText,
                  tipoFiltro === 'egreso' && styles.tipoBtnTextActive,
                ]}
              >
                Egreso
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tipoBtn,
                tipoFiltro === 'ingreso' && styles.tipoBtnActiveIngreso,
              ]}
              onPress={() => {
                setTipoFiltro('ingreso');
                setCategoriaSeleccionada(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.tipoBtnIcon}>💵</Text>
              <Text
                style={[
                  styles.tipoBtnText,
                  tipoFiltro === 'ingreso' && styles.tipoBtnTextActive,
                ]}
              >
                Ingreso
              </Text>
            </TouchableOpacity>
          </View>

          {/* Monto Input */}
          <View style={styles.montoContainer}>
            <Text style={styles.montoSymbol}>$</Text>
            <TextInput
              style={styles.montoInput}
              value={monto}
              onChangeText={setMonto}
              placeholder="0.00"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              maxLength={12}
            />
          </View>

          {/* Descripción */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción (opcional)</Text>
            <TextInput
              style={styles.textInput}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Ej: Compra del supermercado"
              placeholderTextColor={Colors.textMuted}
              maxLength={100}
            />
          </View>

          {/* Categorías */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Categoría</Text>
            {categoriasFiltradas.length === 0 ? (
              <View style={styles.noCategorias}>
                <Text style={styles.noCategoriasText}>
                  No hay categorías de tipo "{tipoFiltro}".{'\n'}
                  Crea una en la pestaña de Categorías.
                </Text>
              </View>
            ) : (
              <View style={styles.categoriasGrid}>
                {categoriasFiltradas.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoriaChip,
                      categoriaSeleccionada === cat.id && {
                        backgroundColor:
                          tipoFiltro === 'ingreso'
                            ? Colors.ingresoBg
                            : Colors.egresoBg,
                        borderColor:
                          tipoFiltro === 'ingreso' ? Colors.ingreso : Colors.egreso,
                      },
                    ]}
                    onPress={() => setCategoriaSeleccionada(cat.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoriaEmoji}>
                      {getCategoriaEmoji(cat.nombre, cat.tipo)}
                    </Text>
                    <Text
                      style={[
                        styles.categoriaName,
                        categoriaSeleccionada === cat.id && {
                          color: Colors.text,
                        },
                      ]}
                    >
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor:
                  tipoFiltro === 'ingreso' ? Colors.ingreso : Colors.egreso,
              },
              cargando && styles.submitBtnDisabled,
            ]}
            onPress={registrarTransaccion}
            disabled={cargando}
            activeOpacity={0.8}
          >
            {cargando ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitBtnText}>
                Registrar {tipoFiltro === 'ingreso' ? 'Ingreso' : 'Egreso'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
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
  tipoToggle: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  tipoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
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
  tipoBtnIcon: {
    fontSize: 20,
  },
  tipoBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tipoBtnTextActive: {
    color: Colors.text,
  },
  montoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  montoSymbol: {
    fontSize: FontSize.hero,
    fontWeight: '800',
    color: Colors.textMuted,
    marginRight: Spacing.sm,
  },
  montoInput: {
    flex: 1,
    fontSize: FontSize.hero,
    fontWeight: '800',
    color: Colors.text,
    padding: 0,
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
  noCategorias: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noCategoriasText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  categoriasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoriaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  categoriaEmoji: {
    fontSize: 16,
  },
  categoriaName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  submitBtn: {
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
});
