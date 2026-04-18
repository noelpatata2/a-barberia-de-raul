import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colores } from '../constantes/colores';
import { useAuth } from '../contexto/AuthContext';
import { cerrarSesion } from '../servicios/autenticacion';
import { NOMBRE_PELUQUERIA } from '../constantes/configuracion';

export default function PerfilScreen() {
  const { usuario, cliente } = useAuth();

  function confirmarPecharSesion() {
    Alert.alert(
      'Pechar sesion',
      'Seguro que queres pechar sesion?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Pechar sesion', style: 'destructive', onPress: cerrarSesion },
      ]
    );
  }

  return (
    <View style={estilos.contenedor}>
      {/* Cabeceira do perfil con fondo dourado */}
      <View style={estilos.cabeceiraPerfil}>
        {/* Avatar: circulo branco con icono de persoa */}
        <View style={estilos.avatarContenedor}>
          <Ionicons name="person" size={40} color="#8B6914" />
        </View>
        <Text style={estilos.nome}>{cliente?.nombre || usuario?.nombre || 'Cliente'}</Text>
        <Text style={estilos.email}>{usuario?.email}</Text>
      </View>

      {/* Tarxeta de estatisticas superposta sobre a cabeceira */}
      <View style={estilos.tarxetaEstatisticas}>
        <View style={estilos.estatistica}>
          <Text style={estilos.estatisticaValor}>{cliente?.totalCitas || 0}</Text>
          <Text style={estilos.estatisticaEtiqueta}>Citas totais</Text>
        </View>
      </View>

      {/* Seccion de informacion en tarxeta branca */}
      <View style={estilos.tarxetaInfo}>
        <View style={estilos.filaInfo}>
          <Ionicons name="storefront-outline" size={22} color="#8B6914" />
          <View style={estilos.filaInfoTexto}>
            <Text style={estilos.filaInfoTitulo}>{NOMBRE_PELUQUERIA}</Text>
            <Text style={estilos.filaInfoDescricion}>A tua peluqueria</Text>
          </View>
        </View>

        {cliente?.telefono ? (
          <View style={[estilos.filaInfo, estilos.filaInfoUltima]}>
            <Ionicons name="call-outline" size={22} color="#8B6914" />
            <View style={estilos.filaInfoTexto}>
              <Text style={estilos.filaInfoTitulo}>{cliente.telefono}</Text>
              <Text style={estilos.filaInfoDescricion}>O teu telefono rexistrado</Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Boton pechar sesion: tarxeta branca con borde vermello */}
      <TouchableOpacity style={estilos.botonPecharSesion} onPress={confirmarPecharSesion}>
        <Ionicons name="log-out-outline" size={22} color="#C0392B" />
        <Text style={estilos.textoPecharSesion}>Pechar sesion</Text>
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  // Cabeceira con fondo dourado principal
  cabeceiraPerfil: {
    backgroundColor: '#8B6914',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  // Avatar: circulo branco con borde dourado claro
  avatarContenedor: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#D4B96A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  nome: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  // Tarxeta de estatisticas branca superposta (marxe negativo)
  tarxetaEstatisticas: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  estatistica: {
    alignItems: 'center',
  },
  estatisticaValor: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8B6914',
  },
  estatisticaEtiqueta: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  // Tarxeta de informacion branca
  tarxetaInfo: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  filaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E0D0',
    gap: 12,
  },
  filaInfoUltima: {
    borderBottomWidth: 0,
  },
  filaInfoTexto: {
    flex: 1,
  },
  filaInfoTitulo: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  filaInfoDescricion: {
    fontSize: 13,
    color: '#999999',
    marginTop: 2,
  },
  // Boton pechar sesion: tarxeta branca con borde vermello
  botonPecharSesion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C0392B',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  textoPecharSesion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#C0392B',
  },
});
