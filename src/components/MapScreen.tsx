import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, {
  Marker,
  UrlTile,
  PROVIDER_DEFAULT,
  LongPressEvent,
} from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocations } from '../hooks/useLocations';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { useAuth } from '../hooks/useAuth';
import { LocationItem } from '../types';
import { DEFAULT_REGION, OSM_TILE_URL } from '../constants/config';
import { logout } from '../services/firebase';
import AddLocationModal from './AddLocationModal';
import LocationListSheet from './LocationListSheet';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { user } = useAuth();
  const { locations, loading, addLocation, removeLocation } = useLocations();
  const { getCurrentPosition, loading: locLoading } = useCurrentLocation();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [addModal, setAddModal] = useState<{
    visible: boolean;
    lat: number;
    lng: number;
  }>({ visible: false, lat: 0, lng: 0 });

  const [hintVisible, setHintVisible] = useState(true);

  const centerOnMyLocation = useCallback(async () => {
    const pos = await getCurrentPosition();
    if (pos && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: pos.latitude,
          longitude: pos.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        600
      );
    }
  }, [getCurrentPosition]);

  const onLongPress = useCallback((e: LongPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setAddModal({ visible: true, lat: latitude, lng: longitude });
    setHintVisible(false);
  }, []);

  const onAddCurrent = useCallback(async () => {
    const pos = await getCurrentPosition();
    if (pos) {
      setAddModal({ visible: true, lat: pos.latitude, lng: pos.longitude });
    } else {
      Alert.alert('Lỗi', 'Không lấy được vị trí hiện tại. Hãy bật GPS.');
    }
  }, [getCurrentPosition]);

  const handleSave = useCallback(
    async (name: string) => {
      await addLocation(name, addModal.lat, addModal.lng);
    },
    [addModal, addLocation]
  );

  const handleSelect = useCallback((item: LocationItem) => {
    setSheetVisible(false);
    mapRef.current?.animateToRegion(
      {
        latitude: item.latitude,
        longitude: item.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      },
      500
    );
  }, []);

  const handleDelete = useCallback(
    async (item: LocationItem) => {
      try {
        await removeLocation(item.id);
      } catch (e) {
        Alert.alert('Lỗi', (e as Error).message);
      }
    },
    [removeLocation]
  );

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={DEFAULT_REGION}
        mapType="none"
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        rotateEnabled
        pitchEnabled={false}
        onLongPress={onLongPress}
        moveOnMarkerPress={false}
      >
        <UrlTile
          urlTemplate={OSM_TILE_URL}
          maximumZ={19}
          flipY={false}
          shouldReplaceMapContent
        />

        {locations.map((item) => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            title={item.name}
            description={`${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`}
            pinColor="#2E7D32"
            onCalloutPress={() => handleSelect(item)}
          />
        ))}
      </MapView>

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topBarInner}>
          <Text style={styles.appTitle} numberOfLines={1}>
            📍 OSM Location
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Thoát</Text>
        </TouchableOpacity>
      </View>

      {hintVisible && locations.length === 0 && (
        <TouchableOpacity
          style={styles.hint}
          onPress={() => setHintVisible(false)}
          activeOpacity={0.9}
        >
          <Text style={styles.hintText}>
            Nhấn giữ trên bản đồ để thêm vị trí{'\n'}hoặc dùng nút + bên dưới
          </Text>
        </TouchableOpacity>
      )}

      <View style={[styles.fabs, { bottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setSheetVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>☰</Text>
          {locations.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{locations.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.fabPrimary]}
          onPress={onAddCurrent}
          activeOpacity={0.85}
          disabled={locLoading}
        >
          {locLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.fabIconWhite}>+</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fab}
          onPress={centerOnMyLocation}
          activeOpacity={0.85}
          disabled={locLoading}
        >
          <Text style={styles.fabIcon}>◎</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      )}

      <AddLocationModal
        visible={addModal.visible}
        latitude={addModal.lat}
        longitude={addModal.lng}
        title="Thêm vị trí"
        onClose={() => setAddModal((s) => ({ ...s, visible: false }))}
        onSave={handleSave}
      />

      <LocationListSheet
        locations={locations}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSelect={handleSelect}
        onDelete={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C8E6C9',
  },
  topBarInner: {
    flex: 1,
  },
  appTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
  },
  userEmail: {
    fontSize: 12,
    color: '#607D8B',
    marginTop: 1,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  logoutText: {
    color: '#C62828',
    fontWeight: '600',
    fontSize: 13,
  },
  hint: {
    position: 'absolute',
    top: 100,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(27,94,32,0.9)',
    borderRadius: 12,
    padding: 14,
  },
  hintText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  fabs: {
    position: 'absolute',
    right: 16,
    gap: 12,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabPrimary: {
    backgroundColor: '#2E7D32',
  },
  fabIcon: {
    fontSize: 22,
    color: '#1B5E20',
  },
  fabIconWhite: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#C62828',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
