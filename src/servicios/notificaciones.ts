// =============================================================================
// Servizo de notificacions push con Firebase Cloud Messaging (FCM)
// Sen dependencia de Expo - usa @react-native-firebase/messaging directamente
// =============================================================================

import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { registrarTokenNotificaciones } from './api';

// Solicitar permisos e obter o token FCM nativo do dispositivo
export async function configurarNotificaciones(): Promise<string | null> {
  try {
    // En Android 13+ (API 33+) hai que pedir o permiso POST_NOTIFICATIONS explicitamente
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const resultado = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (resultado !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('Permiso de notificacions denegado polo usuario');
        return null;
      }
    }

    // Solicitar permisos de FCM
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.warn('Non se concederon permisos para notificacions push');
      return null;
    }

    // Asegurar que o dispositivo esta rexistrado para recibir mensaxes
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }

    // Obter o token FCM
    const token = await messaging().getToken();
    console.log('Token FCM obtido:', token);
    return token;
  } catch (error) {
    console.error('Erro ao configurar notificacions:', error);
    return null;
  }
}

// Rexistrar o token de notificacions no backend (Google Apps Script)
export async function registrarToken(): Promise<void> {
  try {
    const token = await configurarNotificaciones();
    if (token) {
      await registrarTokenNotificaciones(token);
      console.log('Token FCM rexistrado correctamente');
    }
  } catch (error) {
    console.error('Erro ao rexistrar token FCM:', error);
  }
}
