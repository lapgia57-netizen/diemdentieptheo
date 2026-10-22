import { useEffect, useState, useCallback } from 'react';
import { LocationItem } from '../types';
import {
  observeLocations,
  saveLocation,
  deleteLocation,
  friendlyDbError,
} from '../services/firebase';
import { useAuth } from './useAuth';

export function useLocations() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLocations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = observeLocations(
      (list) => {
        setLocations(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(friendlyDbError(err));
        setLoading(false);
      }
    );
    return unsub;
  }, [user?.uid]);

  const addLocation = useCallback(
    async (name: string, latitude: number, longitude: number) => {
      try {
        const id = await saveLocation(name, latitude, longitude);
        return id;
      } catch (e) {
        throw new Error(friendlyDbError(e));
      }
    },
    []
  );

  const removeLocation = useCallback(async (id: string) => {
    try {
      await deleteLocation(id);
    } catch (e) {
      throw new Error(friendlyDbError(e));
    }
  }, []);

  return {
    locations,
    loading,
    error,
    addLocation,
    removeLocation,
  };
}
