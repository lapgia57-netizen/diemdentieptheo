import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { LocationItem } from '../types';

interface Props {
  locations: LocationItem[];
  visible: boolean;
  onClose: () => void;
  onSelect: (item: LocationItem) => void;
  onDelete: (item: LocationItem) => void;
}

export default function LocationListSheet({
  locations,
  visible,
  onClose,
  onSelect,
  onDelete,
}: Props) {
  const [query, setQuery] = useState('');

  if (!visible) return null;

  const filtered = query.trim()
    ? locations.filter(
        (l) =>
          l.name.toLowerCase().includes(query.toLowerCase()) ||
          l.latitude.toString().includes(query) ||
          l.longitude.toString().includes(query)
      )
    : locations;

  const openExternal = (item: LocationItem) => {
    const { latitude, longitude, name } = item;
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?ll=${latitude},${longitude}&q=${encodeURIComponent(name)}`
        : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(name)})`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`
      );
    });
  };

  const confirmDelete = (item: LocationItem) => {
    Alert.alert('Xóa vị trí', `Bạn có chắc muốn xóa "${item.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => onDelete(item),
      },
    ]);
  };

  const formatTime = (ts: number) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d
      .getHours()
      .toString()
      .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.sheet}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Danh sách vị trí ({locations.length})
        </Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Tìm theo tên hoặc tọa độ..."
        placeholderTextColor="#90A4AE"
        value={query}
        onChangeText={setQuery}
        clearButtonMode="while-editing"
      />

      {filtered.length === 0 ? (
        <Text style={styles.empty}>
          {locations.length === 0
            ? 'Chưa có vị trí nào.\nNhấn giữ bản đồ hoặc nút + để thêm.'
            : 'Không tìm thấy kết quả.'}
        </Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => onSelect(item)}
              activeOpacity={0.7}
            >
              <View style={styles.itemBody}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemCoords}>
                  {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                </Text>
                {item.timestamp > 0 && (
                  <Text style={styles.itemTime}>{formatTime(item.timestamp)}</Text>
                )}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => openExternal(item)}
                >
                  <Text style={styles.actionIcon}>↗</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => confirmDelete(item)}
                >
                  <Text style={[styles.actionIcon, { color: '#C62828' }]}>🗑</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '55%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1B5E20',
  },
  close: {
    fontSize: 20,
    color: '#78909C',
    fontWeight: '600',
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
  },
  list: {
    flexGrow: 0,
  },
  empty: {
    textAlign: 'center',
    color: '#78909C',
    padding: 32,
    lineHeight: 22,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECEFF1',
  },
  itemBody: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  itemCoords: {
    fontSize: 12,
    color: '#607D8B',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  itemTime: {
    fontSize: 11,
    color: '#90A4AE',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: '#FFEBEE',
  },
  actionIcon: {
    fontSize: 16,
  },
});
