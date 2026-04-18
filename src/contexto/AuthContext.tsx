import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../firebaseConfig';
import { verificarCliente } from '../servicios/api';
import { registrarToken } from '../servicios/notificaciones';
import { Cliente, EstadoCliente, UsuarioAutenticado } from '../tipos';

const CLAVE_CACHE_CLIENTE = 'cache_cliente';
const CLAVE_CACHE_USUARIO = 'cache_usuario';

interface ContextoAuth {
  usuario: UsuarioAutenticado | null;
  cliente: Cliente | null;
  estadoCliente: EstadoCliente;
  cargando: boolean;
  recargarVerificacion: () => Promise<void>;
}

const AuthContext = createContext<ContextoAuth>({
  usuario: null,
  cliente: null,
  estadoCliente: 'cargando',
  cargando: true,
  recargarVerificacion: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function convertirUsuario(user: User): UsuarioAutenticado {
  return {
    uid: user.uid,
    email: user.email,
    nombre: user.displayName,
    fotoUrl: user.photoURL,
  };
}

export function ProveedorAuth({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [estadoCliente, setEstadoCliente] = useState<EstadoCliente>('cargando');
  const [cargando, setCargando] = useState(true);

  // Gardar cliente en cache local para carga instantanea
  async function gardarCache(usr: UsuarioAutenticado, cli: Cliente) {
    try {
      await AsyncStorage.setItem(CLAVE_CACHE_USUARIO, JSON.stringify(usr));
      await AsyncStorage.setItem(CLAVE_CACHE_CLIENTE, JSON.stringify(cli));
    } catch {}
  }

  async function limparCache() {
    try {
      await AsyncStorage.multiRemove([CLAVE_CACHE_USUARIO, CLAVE_CACHE_CLIENTE]);
    } catch {}
  }

  // Verificar se o usuario esta vinculado a un cliente na folla
  async function verificarEstadoCliente(user?: User) {
    // Non poñer 'cargando' se xa temos datos en cache (evitar flash)
    if (!cliente) {
      setEstadoCliente('cargando');
    }
    try {
      if (user) {
        await user.getIdToken(true);
      }
      const respuesta = await verificarCliente();
      if (respuesta.verificado && respuesta.cliente) {
        setCliente(respuesta.cliente);
        setEstadoCliente('verificado');
        // Gardar en cache para a proxima vez
        if (usuario) {
          gardarCache(usuario, respuesta.cliente);
        }
        // Rexistrar token de notificacions push ao verificar cliente
        registrarToken().catch(() => {});
      } else {
        setCliente(null);
        setEstadoCliente('pendiente');
        limparCache();
      }
    } catch {
      // Se temos cache, non mostrar erro
      if (!cliente) {
        setEstadoCliente('error');
      }
    }
  }

  // Escoitar cambios no estado de autenticacion de Firebase
  useEffect(() => {
    // Cargar cache antes de esperar a Firebase
    async function cargarCache() {
      try {
        const [usrJson, cliJson] = await Promise.all([
          AsyncStorage.getItem(CLAVE_CACHE_USUARIO),
          AsyncStorage.getItem(CLAVE_CACHE_CLIENTE),
        ]);
        if (usrJson && cliJson) {
          const usr: UsuarioAutenticado = JSON.parse(usrJson);
          const cli: Cliente = JSON.parse(cliJson);
          setUsuario(usr);
          setCliente(cli);
          setEstadoCliente('verificado');
          // Non poñer cargando=false aqui, Firebase o fara
        }
      } catch {}
    }
    cargarCache();

    const cancelar = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(convertirUsuario(user));
        // Verificar en segundo plano (se temos cache, a UI xa esta lista)
        verificarEstadoCliente(user);
      } else {
        setUsuario(null);
        setCliente(null);
        setEstadoCliente('cargando');
        limparCache();
      }
      setCargando(false);
    });

    return cancelar;
  }, []);

  const valor: ContextoAuth = {
    usuario,
    cliente,
    estadoCliente,
    cargando,
    recargarVerificacion: verificarEstadoCliente,
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}
