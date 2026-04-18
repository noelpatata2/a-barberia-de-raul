import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import { Colores } from '../constantes/colores';
import { NOMBRE_PELUQUERIA, GOOGLE_CLIENT_ID } from '../constantes/configuracion';
import { iniciarSesionConEmail, registrarConEmail } from '../servicios/autenticacion';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [contrasinal, setContrasinal] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modoRexistro, setModoRexistro] = useState(false);
  const [mostrarContrasinal, setMostrarContrasinal] = useState(false);

  // Iniciar sesion con Google - redireccion transparente via paxina intermedia
  async function iniciarGoogle() {
    setCargando(true);
    try {
      const redirectUri = 'https://barberiaderaul.pages.dev/';
      const authUrl =
        'https://accounts.google.com/o/oauth2/v2/auth?' +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        'response_type=token&' +
        'scope=openid%20profile%20email&' +
        'prompt=select_account';

      const resultado = await WebBrowser.openAuthSessionAsync(authUrl, 'peluqueria-raul-app://');

      if (resultado.type === 'success' && resultado.url) {
        const parteQuery = resultado.url.split('?')[1];
        if (parteQuery) {
          const params = new URLSearchParams(parteQuery);
          const accessToken = params.get('access_token');
          if (accessToken) {
            const credencial = GoogleAuthProvider.credential(null, accessToken);
            await signInWithCredential(auth, credencial);
            return;
          }
        }
      }
      if (resultado.type !== 'cancel' && resultado.type !== 'dismiss') {
        Alert.alert('Erro', 'Non se puido iniciar sesion con Google.');
      }
    } catch {
      Alert.alert('Erro', 'Non se puido iniciar sesion con Google.');
    } finally {
      setCargando(false);
    }
  }

  async function manejarLoginEmail() {
    if (!email.trim() || !contrasinal.trim()) {
      Alert.alert('Erro', 'Introduce o teu email e contrasinal.');
      return;
    }

    setCargando(true);
    try {
      if (modoRexistro) {
        await registrarConEmail(email.trim(), contrasinal);
      } else {
        await iniciarSesionConEmail(email.trim(), contrasinal);
      }
    } catch (error: any) {
      let mensaxe = 'Ocorreu un erro. Intentao de novo.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        mensaxe = 'Email ou contrasinal incorrectos.';
      } else if (error.code === 'auth/email-already-in-use') {
        mensaxe = 'Este email xa esta rexistrado. Inicia sesion no seu lugar.';
      } else if (error.code === 'auth/weak-password') {
        mensaxe = 'O contrasinal debe ter polo menos 6 caracteres.';
      } else if (error.code === 'auth/invalid-email') {
        mensaxe = 'O formato do email non e valido.';
      }
      Alert.alert('Erro', mensaxe);
    } finally {
      setCargando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={estilos.scrollContido}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabeceira con gradiente dourado calido */}
        <LinearGradient
          colors={['#D4B96A', '#C8A84E', '#8B6914']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={estilos.cabeceira}
        >
          {/* Foto do barbeiro */}
          <Image
            source={require('../../assets/raul.png')}
            style={{width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#D4B96A'}}
          />
          <Text style={estilos.titulo}>{NOMBRE_PELUQUERIA}</Text>
          <Text style={estilos.subtitulo}>A Estrada</Text>
        </LinearGradient>

        {/* Formulario sobre fondo crema */}
        <View style={estilos.formulario}>
          {/* Boton Google: branco con borde crema sutil */}
          <TouchableOpacity
            style={estilos.botonGoogle}
            onPress={iniciarGoogle}
            disabled={cargando}
          >
            <Ionicons name="logo-google" size={20} color={Colores.textoOscuro} />
            <Text style={estilos.textoBotonGoogle}>Continuar con Google</Text>
          </TouchableOpacity>

          {/* Separador con "ou" */}
          <View style={estilos.separador}>
            <View style={estilos.linaSeparador} />
            <Text style={estilos.textoSeparador}>ou</Text>
            <View style={estilos.linaSeparador} />
          </View>

          {/* Email */}
          <View style={estilos.campoInput}>
            <Ionicons name="mail-outline" size={20} color={Colores.textoClaro} style={estilos.iconoInput} />
            <TextInput
              style={estilos.input}
              placeholder="Email"
              placeholderTextColor={Colores.textoClaro}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Contrasinal */}
          <View style={estilos.campoInput}>
            <Ionicons name="lock-closed-outline" size={20} color={Colores.textoClaro} style={estilos.iconoInput} />
            <TextInput
              style={estilos.input}
              placeholder="Contrasinal"
              placeholderTextColor={Colores.textoClaro}
              value={contrasinal}
              onChangeText={setContrasinal}
              secureTextEntry={!mostrarContrasinal}
            />
            <TouchableOpacity onPress={() => setMostrarContrasinal(!mostrarContrasinal)}>
              <Ionicons
                name={mostrarContrasinal ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colores.textoClaro}
              />
            </TouchableOpacity>
          </View>

          {/* Esqueceu o contrasinal */}
          {!modoRexistro && (
            <TouchableOpacity
              style={estilos.botonEsqueceuContrasinal}
              onPress={() => {
                if (!email.trim()) {
                  Alert.alert('Erro', 'Introduce o teu email primeiro.');
                  return;
                }
                import('firebase/auth').then(({ sendPasswordResetEmail }) => {
                  sendPasswordResetEmail(auth, email.trim())
                    .then(() => Alert.alert('Email enviado', 'Revisa a tua bandexa de entrada para restablecer o contrasinal.\n\nSe non o ves, revisa a carpeta de spam.'))
                    .catch(() => Alert.alert('Erro', 'Non se puido enviar o email. Comproba que o email e correcto.'));
                });
              }}
            >
              <Text style={estilos.textoEsqueceuContrasinal}>Esqueceu o contrasinal?</Text>
            </TouchableOpacity>
          )}

          {/* Boton principal dourado */}
          <TouchableOpacity
            style={estilos.botonPrincipal}
            onPress={manejarLoginEmail}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color={Colores.textoBlanco} />
            ) : (
              <Text style={estilos.textoBotonPrincipal}>
                {modoRexistro ? 'Crear conta' : 'Iniciar sesion'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Alternar modo rexistro / inicio sesion */}
          <TouchableOpacity
            style={estilos.botonAlternar}
            onPress={() => setModoRexistro(!modoRexistro)}
          >
            <Text style={estilos.textoAlternar}>
              {modoRexistro
                ? 'Xa tes conta? Inicia sesion'
                : 'Non tes conta? Rexistrate'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#8B6914',
  },
  scrollContido: {
    flexGrow: 1,
  },
  // Cabeceira con gradiente dourado calido (de claro arriba a escuro abaixo)
  cabeceira: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 48,
  },
  // Circulo branco con borde dourado para o icono de barbeiro
  iconoContenedor: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#D4B96A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitulo: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    fontWeight: '400',
  },
  // Formulario sobre fondo crema calido con esquinas superiores redondeadas
  formulario: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  // Boton Google: tarxeta branca con borde crema sutil
  botonGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E8E0D0',
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  textoBotonGoogle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  // Separador con lina e texto "ou"
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  linaSeparador: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E0D0',
  },
  textoSeparador: {
    marginHorizontal: 16,
    color: '#999999',
    fontSize: 14,
  },
  // Campos de entrada con fondo crema claro
  campoInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E0D0',
  },
  iconoInput: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
  },
  // Boton principal: dourado recheo con texto branco
  botonPrincipal: {
    backgroundColor: '#8B6914',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  textoBotonPrincipal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Enlace para restablecer contrasinal
  botonEsqueceuContrasinal: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    marginTop: -4,
  },
  textoEsqueceuContrasinal: {
    fontSize: 13,
    color: '#8B6914',
  },
  // Texto para alternar entre rexistro e inicio de sesion
  botonAlternar: {
    alignItems: 'center',
    marginTop: 16,
  },
  textoAlternar: {
    fontSize: 14,
    color: '#8B6914',
    fontWeight: '500',
  },
});
