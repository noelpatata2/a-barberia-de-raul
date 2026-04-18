// Punto de entrada principal da aplicacion
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PermissionsAndroid, Platform } from 'react-native';
import { ProveedorAuth } from './src/contexto/AuthContext';
import AppNavigator from './src/navegacion/AppNavigator';

export default function App() {
  // Solicitar permisos de notificacion ao iniciar a app (antes do login)
  useEffect(() => {
    async function pedirPermisoNotificacions() {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      }
    }
    pedirPermisoNotificacions();
  }, []);

  return (
    <ProveedorAuth>
      <AppNavigator />
      <StatusBar style="light" />
    </ProveedorAuth>
  );
}
