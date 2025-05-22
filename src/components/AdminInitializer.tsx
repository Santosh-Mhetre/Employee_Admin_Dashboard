'use client';

import { useEffect, useState } from 'react';
import { initializeAdminUsers } from '@/firebase/admin-auth';

export default function AdminInitializer() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupAdmins = async () => {
      try {
        console.log('Starting admin users initialization...');
        await initializeAdminUsers();
        setInitialized(true);
        console.log('Admin users initialization completed successfully');
      } catch (err) {
        console.error('Error initializing admin users:', err);
        setError('Failed to initialize admin users');
      }
    };

    setupAdmins();
  }, []);

  // This component doesn't render anything visible
  return null;
} 