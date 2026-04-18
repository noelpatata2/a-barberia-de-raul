import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  User,
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';

// Iniciar sesion con email e contrasinal
export async function iniciarSesionConEmail(email: string, contrasena: string): Promise<User> {
  const resultado = await signInWithEmailAndPassword(auth, email, contrasena);
  return resultado.user;
}

// Rexistrar novo usuario con email e contrasinal
export async function registrarConEmail(email: string, contrasena: string): Promise<User> {
  const resultado = await createUserWithEmailAndPassword(auth, email, contrasena);
  return resultado.user;
}

// Iniciar sesion con credencial de Google (obtida via expo-auth-session)
export async function iniciarSesionConGoogle(idToken: string): Promise<User> {
  const credencial = GoogleAuthProvider.credential(idToken);
  const resultado = await signInWithCredential(auth, credencial);
  return resultado.user;
}

// Pechar sesion
export async function cerrarSesion(): Promise<void> {
  await signOut(auth);
}

// Obter token de ID do usuario actual (para enviar ao backend)
export async function obtenerTokenId(): Promise<string | null> {
  const usuario = auth.currentUser;
  if (!usuario) return null;
  return usuario.getIdToken();
}
