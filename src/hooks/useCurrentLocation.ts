import { useState, useCallback } from 'react';
import * as Location from 'expo-location';

export function useCurrentLocation() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setPermissionGranted(granted);
      if (!granted) {
        setError('Cần cấp quyền vị trí để sử dụng tính năng này.');
      }
      return granted;
    } catch (e) {
      setError('Không thể yêu cầu quyền vị trí.');
      return false;
    }
  }, []);

  const getCurrentPosition = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let granted = permissionGranted;
      if (!granted) {
        granted = await requestPermission();
      }
      if (!granted) {
        setLoading(false);
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const result = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCoords(result);
      setLoading(false);
      return result;
    } catch (e) {
      setError('Không lấy được vị trí. Hãy bật GPS và thử lại.');
      setLoading(false);
      return null;
    }
  }, [permissionGranted, requestPermission]);

  return {
    coords,
    loading,
    error,
    permissionGranted,
    requestPermission,
    getCurrentPosition,
  };
}
