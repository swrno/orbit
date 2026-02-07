"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export function useAuthToken() {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      if (user) {
        const idToken = await user.getIdToken();
        setToken(idToken);
      } else {
        setToken(null);
      }
    };

    getToken();
  }, [user]);

  return token;
}

export function useAuthHeaders() {
  const token = useAuthToken();

  return token
    ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    : {
        'Content-Type': 'application/json',
      };
}
