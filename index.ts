import { registerRootComponent } from 'expo';
import messaging from '@react-native-firebase/messaging';

import App from './App';

// Rexistrar handler para mensaxes FCM en segundo plano
// DEBE estar fora de calquera compoñente, no punto de entrada da app
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Mensaxe FCM en segundo plano:', remoteMessage);
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
