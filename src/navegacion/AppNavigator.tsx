import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexto/AuthContext';
import { Colores } from '../constantes/colores';

import LoginScreen from '../pantallas/LoginScreen';
import VerificacionPendienteScreen from '../pantallas/VerificacionPendienteScreen';
import MisCitasScreen from '../pantallas/MisCitasScreen';
import CitasAnualesScreen from '../pantallas/CitasAnualesScreen';
import HistorialScreen from '../pantallas/HistorialScreen';
import PerfilScreen from '../pantallas/PerfilScreen';
import CancelarCitaScreen from '../pantallas/CancelarCitaScreen';
import SolicitudeEnviadaScreen from '../pantallas/SolicitudeEnviadaScreen';
import SolicitarCitaExtraScreen from '../pantallas/SolicitarCitaExtraScreen';
import SolicitudCitaEnviadaScreen from '../pantallas/SolicitudCitaEnviadaScreen';
import PreferenciasCitasScreen from '../pantallas/PreferenciasCitasScreen';
import ReasignarCitaScreen from '../pantallas/ReasignarCitaScreen';
import SolicitudeReasignacionEnviadaScreen from '../pantallas/SolicitudeReasignacionEnviadaScreen';

const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navegacion por pestanas para usuarios verificados
// 4 pestanas: Inicio, Citas, Historial, Perfil
function PestanasPrincipales() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let nombreIcono: keyof typeof Ionicons.glyphMap = 'help';

          if (route.name === 'Inicio') {
            nombreIcono = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Citas') {
            nombreIcono = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Historial') {
            nombreIcono = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Perfil') {
            nombreIcono = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={nombreIcono} size={size} color={color} />;
        },
        // Barra de pestanas: fondo crema (#F5F0E8), icono activo dorado, inactivo gris
        tabBarActiveTintColor: '#8B6914',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          backgroundColor: '#F5F0E8',
          borderTopColor: Colores.borde,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: 6,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        // Cabeceira por defecto para as demais pestanas
        headerStyle: {
          backgroundColor: Colores.fondoTarjeta,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colores.borde,
        },
        headerTintColor: Colores.textoOscuro,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={MisCitasScreen}
        options={{ headerShown: false, title: 'Inicio' }}
      />
      <Tab.Screen
        name="Citas"
        component={CitasAnualesScreen}
        options={{ headerShown: false, title: 'Citas' }}
      />
      <Tab.Screen
        name="Historial"
        component={HistorialScreen}
        options={{ title: 'Historial' }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

// Pantalla de carga mentres se verifica a conta do usuario
// Fondo crema con acentos dourados
function PantallaCargaVerificacion() {
  return (
    <View style={estilosCarga.contenedor}>
      <View style={estilosCarga.contenido}>
        <View style={estilosCarga.iconoContenedor}>
          <Ionicons name="cut" size={48} color={Colores.primarioClaro} />
        </View>
        <Text style={estilosCarga.titulo}>Barbería Raúl</Text>
        <Text style={estilosCarga.subtitulo}>A Estrada</Text>
        <ActivityIndicator size="large" color={Colores.primarioClaro} style={estilosCarga.indicador} />
        <Text style={estilosCarga.mensaje}>Verificando a tua conta...</Text>
      </View>
    </View>
  );
}

const estilosCarga = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: Colores.fondo,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenido: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  // Circulo con borde dourado para o icono de tesoiras
  iconoContenedor: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colores.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: Colores.textoOscuro,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 16,
    color: Colores.textoClaro,
    marginBottom: 32,
  },
  indicador: {
    marginBottom: 16,
  },
  mensaje: {
    fontSize: 16,
    color: Colores.textoClaro,
  },
});

// Navegacion principal: pestanas + pantallas modais de cancelacion
function NavegacionPrincipal() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Principal" component={PestanasPrincipales} />
      <RootStack.Screen
        name="CancelarCita"
        component={CancelarCitaScreen}
        options={{ presentation: 'card' }}
      />
      <RootStack.Screen
        name="SolicitudeEnviada"
        component={SolicitudeEnviadaScreen}
        options={{ presentation: 'card' }}
      />
      <RootStack.Screen
        name="SolicitarCitaExtra"
        component={SolicitarCitaExtraScreen}
        options={{ presentation: 'card' }}
      />
      <RootStack.Screen
        name="SolicitudCitaEnviada"
        component={SolicitudCitaEnviadaScreen}
        options={{ presentation: 'card' }}
      />
      <RootStack.Screen
        name="PreferenciasCitas"
        component={PreferenciasCitasScreen}
        options={{ presentation: 'card' }}
      />
      <RootStack.Screen
        name="ReasignarCita"
        component={ReasignarCitaScreen}
        options={{ presentation: 'card' }}
      />
      <RootStack.Screen
        name="SolicitudeReasignacionEnviada"
        component={SolicitudeReasignacionEnviadaScreen}
        options={{ presentation: 'card' }}
      />
    </RootStack.Navigator>
  );
}

export default function AppNavigator() {
  const { usuario, estadoCliente, cargando } = useAuth();

  // Pantalla de carga inicial mentres Firebase resolve o estado de autenticacion
  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colores.fondo }}>
        <ActivityIndicator size="large" color={Colores.primario} />
      </View>
    );
  }

  // Se o usuario esta autenticado pero ainda se verifica contra a base de datos,
  // mostrar pantalla de carga en vez da pantalla de verificacion pendente
  if (usuario && estadoCliente === 'cargando') {
    return <PantallaCargaVerificacion />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!usuario ? (
          // Non autenticado: mostrar login
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : estadoCliente === 'pendiente' || estadoCliente === 'error' ? (
          // Autenticado pero non vinculado a un cliente ou erro ao verificar
          <Stack.Screen name="VerificacionPendiente" component={VerificacionPendienteScreen} />
        ) : (
          // Autenticado e verificado: mostrar app principal con pantallas modais
          <Stack.Screen name="AppPrincipal" component={NavegacionPrincipal} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
