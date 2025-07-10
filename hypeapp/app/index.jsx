import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, getAuth } from '@react-native-firebase/auth';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        router.replace('/(loggedin)/(tabs)/explore');
      } else {
        router.replace('/(login)');
      }
    });

    return unsubscribe;
  }, []);

  return null;
}
