import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colores } from '../constantes/colores';
import { useAuth } from '../contexto/AuthContext';
import { cerrarSesion } from '../servicios/autenticacion';
import { NOMBRE_PELUQUERIA } from '../constantes/configuracion';

export default function VerificacionPendienteScreen() {
  const { usuario, estadoCliente, recargarVerificacion } = useAuth();
  const [recargando, setRecargando] = useState(false);

  async function manejarRecargar() {
    setRecargando(true);
    await recargarVerificacion();
    setRecargando(false);
  }

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.contido}>
        {/* Icono en circulo con ton dourado */}
        <View style={estilos.iconoContenedor}>
          <Ionicons name="hourglass-outline" size={64} color={Colores.advertencia} />
        </View>

        <Text style={estilos.titulo}>Verificacion pendente</Text>

        <Text style={estilos.descricion}>
          A tua conta ({usuario?.email}) ainda non esta vinculada a un perfil de cliente.
        </Text>

        <Text style={estilos.instruccions}>
          Pide ao barbeiro que asocie o teu email co teu nome no sistema de {NOMBRE_PELUQUERIA}.
        </Text>

        {estadoCliente === 'error' && (
          <View style={estilos.erroContenedor}>
            <Ionicons name="alert-circle-outline" size={20} color={Colores.error} />
            <Text style={estilos.erroTexto}>
              Erro ao verificar a tua conta. Comproba a tua conexion e intentao de novo.
            </Text>
          </View>
        )}

        {/* Boton principal dourado */}
        <TouchableOpacity
          style={estilos.botonRecargar}
          onPress={manejarRecargar}
          disabled={recargando}
        >
          {recargando ? (
            <ActivityIndicator color={Colores.textoBlanco} />
          ) : (
            <>
              <Ionicons name="refresh-outline" size={20} color={Colores.textoBlanco} />
              <Text style={estilos.textoBotonRecargar}>Comprobar de novo</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={estilos.botonPecharSesion}
          onPress={cerrarSesion}
        >
          <Text style={estilos.textoBotonPecharSesion}>Pechar sesion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  // Fondo crema calido
  contenedor: {
    flex: 1,
    backgroundColor: Colores.fondo,
    justifyContent: 'center',
  },
  contido: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  // Circulo con fondo ambar suave
  iconoContenedor: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(200, 168, 78, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: Colores.textoOscuro,
    marginBottom: 16,
    textAlign: 'center',
  },
  descricion: {
    fontSize: 16,
    color: Colores.textoMedio,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  instruccions: {
    fontSize: 14,
    color: Colores.textoClaro,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  // Contenedor de erro con fondo vermello suave
  erroContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(192, 57, 43, 0.08)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  erroTexto: {
    flex: 1,
    fontSize: 14,
    color: Colores.error,
  },
  // Boton dourado recheo
  botonRecargar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colores.primario,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    width: '100%',
  },
  textoBotonRecargar: {
    fontSize: 16,
    fontWeight: '600',
    color: Colores.textoBlanco,
  },
  botonPecharSesion: {
    marginTop: 16,
    paddingVertical: 12,
  },
  textoBotonPecharSesion: {
    fontSize: 14,
    color: Colores.error,
  },
});
