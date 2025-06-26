import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, getAuth } from '@react-native-firebase/auth';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/sign-in');
      }
    });

    return unsubscribe;
  }, []);

  return null;
}
