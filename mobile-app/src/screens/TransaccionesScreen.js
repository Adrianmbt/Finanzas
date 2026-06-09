import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme';

export default function TransaccionesScreen() {
  const [transacciones, setTransacciones] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const cargarTransacciones = async () => {
    try {
      setError(null);
      const data = await api.getTransacciones();
      setTransacciones(data);
    } catch (err) {
      setError(err.message || 'Error al cargar transacciones');
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarTransacciones();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarTransacciones();
    setRefreshing(false);
  };

  const formatMoney = (amount) => {
    return amount.toLocaleString('es-DO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatFullDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-DO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-DO', {
      hour: '2-digit',
      minute: '2-digit',
    });
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

  // Agrupar transacciones por fecha
  const transaccionesPorFecha = transacciones.reduce(
    (groups, trans) => {
      const dateKey = new Date(trans.fecha).toLocaleDateString('es-DO');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(trans);
      return groups;
    },
    {}
  );

  const groupedData = Object.entries(transaccionesPorFecha).map(([date, items]) => ({
    date,
    displayDate: formatFullDate(items[0].fecha),
    total: items.reduce(
      (sum, t) => sum + (t.categoria.tipo === 'egreso' ? -t.monto : t.monto),
      0
    ),
    items,
  }));

  const renderTransaction = (trans) => (
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
          <Text style={styles.transactionName} numberOfLines={1}>
            {trans.descripcion || trans.categoria.nombre}
          </Text>
          <Text style={styles.transactionMeta}>
            {trans.categoria.nombre} · {formatTime(trans.fecha)}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          {
            color:
              trans.categoria.tipo === 'ingreso' ? Colors.ingreso : Colors.egreso,
          },
        ]}
      >
        {trans.categoria.tipo === 'ingreso' ? '+' : '-'}${formatMoney(trans.monto)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transacciones</Text>
        <Text style={styles.subtitle}>
          {transacciones.length} movimiento{transacciones.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {transacciones.length === 0 && !error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>No hay transacciones</Text>
          <Text style={styles.emptySubtitle}>
            Las transacciones que registres aparecerán aquí organizadas por fecha
          </Text>
        </View>
      ) : (
        <FlatList
          data={groupedData}
          keyExtractor={(item) => item.date}
          renderItem={({ item: group }) => (
            <View style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateText}>{group.displayDate}</Text>
                <Text
                  style={[
                    styles.dateTotal,
                    { color: group.total >= 0 ? Colors.ingreso : Colors.egreso },
                  ]}
                >
                  {group.total >= 0 ? '+' : ''}${formatMoney(group.total)}
                </Text>
              </View>
              {group.items.map(renderTransaction)}
            </View>
          )}
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
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
  errorBanner: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
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
  dateGroup: {
    marginBottom: Spacing.lg,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateTotal: {
    fontSize: FontSize.sm,
    fontWeight: '700',
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
  transactionMeta: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginLeft: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.xl,
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
    lineHeight: 22,
  },
});
