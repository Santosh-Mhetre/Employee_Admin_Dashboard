'use client';

import { useEffect, useState } from 'react';
import { initializeAdminUsers } from '@/firebase/admin-auth';

export default function AdminInitializer() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAdmins = async () => {
      try {
        console.log('Initializing admin users...');
        await initializeAdminUsers();
        setInitialized(true);
        console.log('Admin users initialized successfully');
      } catch (error: any) {
        console.error('Error initializing admin users:', error);
        setError(error.message || 'Failed to initialize admin users');
      }
    };

    initAdmins();
  }, []);

  // This component doesn't render anything visible
  return null;
} 