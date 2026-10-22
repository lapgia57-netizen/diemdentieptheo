import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface Props {
  visible: boolean;
  latitude: number;
  longitude: number;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  title?: string;
}

export default function AddLocationModal({
  visible,
  latitude,
  longitude,
  onClose,
  onSave,
  title = 'Thêm vị trí',
}: Props) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName('');
      setError(null);
      setSaving(false);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Vui lòng nhập tên vị trí');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(name.trim());
      onClose();
    } catch (e) {
      setError((e as Error).message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.coords}>
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Tên vị trí (ví dụ: Nhà, Công ty...)"
            placeholderTextColor="#90A4AE"
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={80}
            editable={!saving}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel]}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.btnCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnSave]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnSaveText}>Lưu</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 4,
  },
  coords: {
    fontSize: 13,
    color: '#607D8B',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212121',
    backgroundColor: '#F1F8E9',
  },
  error: {
    color: '#C62828',
    marginTop: 8,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: '#ECEFF1',
  },
  btnCancelText: {
    color: '#455A64',
    fontWeight: '600',
    fontSize: 15,
  },
  btnSave: {
    backgroundColor: '#2E7D32',
  },
  btnSaveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
