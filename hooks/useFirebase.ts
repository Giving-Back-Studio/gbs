import { useState, useEffect } from 'react';
import { initializeFirebase } from '@/lib/firebase-init';

export function useFirebase() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeFirebase();
    setIsInitialized(true);
  }, []);

  return isInitialized;
}

