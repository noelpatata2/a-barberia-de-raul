import { initializeApp, getApps } from 'firebase/app';
//@ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_CONFIG } from './src/constantes/configuracion';

// Inicializar Firebase so se non hai instancias previas
const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];

// Inicializar Auth con persistencia en AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { app, auth };
