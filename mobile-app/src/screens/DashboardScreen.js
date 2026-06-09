import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [resumen, setResumen] = useState({
    totalIngresos: 0,
    totalEgresos: 0,
    balance: 0,
    transaccionesRecientes: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const cargarDatos = async () => {
    try {
      setError(null);
      const transacciones = await api.getTransacciones();

      const totalIngresos = transacciones
        .filter((t) => t.categoria.tipo === 'ingreso')
        .reduce((sum, t) => sum + t.monto, 0);

      const totalEgresos = transacciones
        .filter((t) => t.categoria.tipo === 'egreso')
        .reduce((sum, t) => sum + t.monto, 0);

      setResumen({
        totalIngresos,
        totalEgresos,
        balance: totalIngresos - totalEgresos,
        transaccionesRecientes: transacciones.slice(0, 8),
      });
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  const formatMoney = (amount) => {
    return amount.toLocaleString('es-DO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString('es-DO', { day: 'numeric', month: 'short' });
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>¡Hola! 👋</Text>
          <Text style={styles.subtitle}>Resumen de finanzas</Text>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceGlow} />
          <Text style={styles.balanceLabel}>Balance General</Text>
          <Text
            style={[
              styles.balanceAmount,
              { color: resumen.balance >= 0 ? Colors.ingreso : Colors.egreso },
            ]}
          >
            ${formatMoney(resumen.balance)}
          </Text>

          {/* Income / Expense Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: Colors.ingreso }]} />
              <View>
                <Text style={styles.statLabel}>Ingresos</Text>
                <Text style={[styles.statAmount, { color: Colors.ingreso }]}>
                  +${formatMoney(resumen.totalIngresos)}
                </Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: Colors.egreso }]} />
              <View>
                <Text style={styles.statLabel}>Egresos</Text>
                <Text style={[styles.statAmount, { color: Colors.egreso }]}>
                  -${formatMoney(resumen.totalEgresos)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimas transacciones</Text>
          <Text style={styles.sectionCount}>
            {resumen.transaccionesRecientes.length}
          </Text>
        </View>

        {resumen.transaccionesRecientes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>Sin transacciones aún</Text>
            <Text style={styles.emptySubtitle}>
              Agrega tu primer gasto o ingreso para empezar
            </Text>
          </View>
        ) : (
          resumen.transaccionesRecientes.map((trans) => (
            <View key={trans.id} style={styles.transactionCard}>
              <View style={styles.transactionLeft}>
                <View
                  style={[
                    styles.transactionIcon,
                    {
                      backgroundColor:
                        trans.categoria.tipo === 'ingreso'
                          ? Colors.ingresoBg
                          : Colors.egresoBg,
                    },
                  ]}
                >
                  <Text style={styles.transactionEmoji}>
                    {getCategoriaEmoji(trans.categoria.nombre, trans.categoria.tipo)}
                  </Text>
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionName}>
                    {trans.descripcion || trans.categoria.nombre}
                  </Text>
                  <Text style={styles.transactionCategory}>
                    {trans.categoria.nombre} · {formatDate(trans.fecha)}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color:
                      trans.categoria.tipo === 'ingreso'
                        ? Colors.ingreso
                        : Colors.egreso,
                  },
                ]}
              >
                {trans.categoria.tipo === 'ingreso' ? '+' : '-'}$
                {formatMoney(trans.monto)}
              </Text>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
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
  greeting: {
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
  balanceCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  balanceGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primary,
    opacity: 0.08,
  },
  balanceLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: FontSize.hero,
    fontWeight: '800',
    marginTop: Spacing.sm,
    letterSpacing: -1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statAmount: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionCount: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  transactionCard: {
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
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionEmoji: {
    fontSize: 20,
  },
  transactionInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  transactionName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  transactionCategory: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
