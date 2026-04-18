import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colores } from '../constantes/colores';
import { Cita } from '../tipos';

// Nomes dos dias en galego
const DIAS_GALEGO: Record<string, string> = {
  Lunes: 'Luns',
  Martes: 'Martes',
  Miercoles: 'Mercores',
  Jueves: 'Xoves',
  Viernes: 'Venres',
  Sabado: 'Sabado',
  Domingo: 'Domingo',
};

// Nomes dos meses en galego
const MESES_GALEGO = [
  'Xaneiro', 'Febreiro', 'Marzo', 'Abril', 'Maio', 'Xuno',
  'Xullo', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Decembro',
];

// Formatear fecha en galego: "Martes, 15 Abril 2025"
function formatearFechaGalego(cita: Cita): string {
  const diaGalego = DIAS_GALEGO[cita.dia] || cita.dia;
  const partes = cita.fecha.split('/');
  const mes = MESES_GALEGO[parseInt(partes[1]) - 1];
  const ano = partes[2];
  const dia = parseInt(partes[0]);
  return `${diaGalego}, ${dia} ${mes} ${ano}`;
}

// Obter hora actual formateada
function obterHoraActual(): string {
  const agora = new Date();
  const horas = agora.getHours().toString().padStart(2, '0');
  const minutos = agora.getMinutes().toString().padStart(2, '0');
  return `${horas}:${minutos}`;
}

// Pasos do proceso
const PASOS = [
  { numero: '1', texto: 'Solicitude recibida polo xerente', activo: true },
  { numero: '2', texto: 'Xerente revisa e aproba', activo: false },
  { numero: '3', texto: 'Recibes confirmacion na app', activo: false },
];

export default function SolicitudeEnviadaScreen({ route, navigation }: any) {
  const { cita, motivo } = route.params as { cita: Cita; motivo: string };
  const horaEnvio = obterHoraActual();

  function voltarAoInicio() {
    navigation.navigate('Principal', { screen: 'Inicio' });
  }

  return (
    <View style={estilos.contenedor}>
      {/* Cabeceira */}
      <View style={estilos.cabeceira}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.botonVoltar}>
          <Ionicons name="chevron-back" size={24} color={Colores.textoOscuro} />
        </TouchableOpacity>
        <Text style={estilos.tituloCabeceira}>Solicitude Enviada</Text>
      </View>

      <ScrollView style={estilos.scroll} contentContainerStyle={estilos.scrollContido}>
        {/* Icona central */}
        <View style={estilos.iconaCentral}>
          <View style={estilos.iconaCirculo}>
            <Ionicons name="help" size={48} color="#E8A317" />
          </View>
        </View>

        {/* Titulo e subtitulo */}
        <Text style={estilos.tituloConfirmacion}>Solicitude de cancelacion enviada</Text>

        {/* Estado actual da cita */}
        <Text style={estilos.tituloSeccion}>Estado actual da cita</Text>
        <View style={estilos.tarxetaEstado}>
          <View style={estilos.tarxetaEstadoBordeLateral} />
          <View style={estilos.tarxetaEstadoContido}>
            <Text style={estilos.estadoFecha}>{formatearFechaGalego(cita)}</Text>
            <Text style={estilos.estadoDetalle}>
              {cita.hora}h - {cita.servicio}
            </Text>
            <View style={estilos.badgePendente}>
              <Text style={estilos.badgePendenteTexto}>Pendente de cancelacion</Text>
            </View>
            <Text style={estilos.estadoEnvio}>Enviado: hoxe as {horaEnvio}h</Text>
          </View>
        </View>

        {/* Que ocorre agora */}
        <View style={estilos.caixaPasos}>
          <Text style={estilos.caixaPasosTitulo}>Que ocorre agora?</Text>
          {PASOS.map((paso, indice) => (
            <View key={paso.numero} style={estilos.pasoFila}>
              <View
                style={[
                  estilos.pasoCirculo,
                  paso.activo ? estilos.pasoCirculoActivo : estilos.pasoCirculoInactivo,
                ]}
              >
                <Text
                  style={[
                    estilos.pasoNumero,
                    paso.activo ? estilos.pasoNumeroActivo : estilos.pasoNumeroInactivo,
                  ]}
                >
                  {paso.numero}
                </Text>
              </View>
              {/* Lina conectora entre pasos */}
              {indice < PASOS.length - 1 && (
                <View style={estilos.pasoLina} />
              )}
              <Text
                style={[
                  estilos.pasoTexto,
                  paso.activo ? estilos.pasoTextoActivo : estilos.pasoTextoInactivo,
                ]}
              >
                {paso.texto}
              </Text>
            </View>
          ))}
        </View>

        {/* Previsualizacion en citas anuais */}
        <Text style={estilos.tituloSeccion}>Como aparecera nas tuas citas anuais:</Text>
        <View style={estilos.tarxetaPrevisualizacion}>
          <View style={estilos.previewContido}>
            <Text style={estilos.previewFecha}>{formatearFechaGalego(cita)}</Text>
            <Text style={estilos.previewDetalle}>
              {cita.hora}h - {cita.servicio}
            </Text>
          </View>
          <View style={estilos.badgePteCancelacion}>
            <Text style={estilos.badgePteCancelacionTexto}>Pte. cancelacion</Text>
          </View>
        </View>

        {/* Boton volver ao inicio */}
        <TouchableOpacity
          style={estilos.botonInicio}
          onPress={voltarAoInicio}
          activeOpacity={0.8}
        >
          <Text style={estilos.botonInicioTexto}>Volver ao inicio</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: Colores.fondo,
  },
  cabeceira: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: Colores.fondoTarjeta,
    borderBottomWidth: 1,
    borderBottomColor: Colores.borde,
  },
  botonVoltar: {
    padding: 4,
    marginRight: 12,
  },
  tituloCabeceira: {
    fontSize: 20,
    fontWeight: '700',
    color: Colores.textoOscuro,
  },
  scroll: {
    flex: 1,
  },
  scrollContido: {
    padding: 16,
    paddingBottom: 32,
  },
  // Icona central
  iconaCentral: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  iconaCirculo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF3CD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Confirmacion
  tituloConfirmacion: {
    fontSize: 18,
    fontWeight: '700',
    color: Colores.textoOscuro,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtituloConfirmacion: {
    marginBottom: 24,
  },
  // Seccion
  tituloSeccion: {
    fontSize: 15,
    fontWeight: '700',
    color: Colores.textoOscuro,
    marginBottom: 10,
    marginTop: 8,
  },
  // Tarxeta de estado
  tarxetaEstado: {
    flexDirection: 'row',
    backgroundColor: Colores.fondoTarjeta,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colores.borde,
  },
  tarxetaEstadoBordeLateral: {
    width: 4,
    backgroundColor: Colores.primarioOscuro,
  },
  tarxetaEstadoContido: {
    flex: 1,
    padding: 14,
  },
  estadoFecha: {
    fontSize: 15,
    fontWeight: '700',
    color: Colores.textoOscuro,
  },
  estadoDetalle: {
    fontSize: 13,
    color: Colores.textoMedio,
    marginTop: 3,
  },
  badgePendente: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  badgePendenteTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E8A317',
  },
  estadoEnvio: {
    fontSize: 11,
    color: Colores.textoClaro,
    marginTop: 8,
  },
  // Caixa de pasos
  caixaPasos: {
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  caixaPasosTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: Colores.textoOscuro,
    marginBottom: 14,
  },
  pasoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  pasoCirculo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pasoCirculoActivo: {
    backgroundColor: Colores.exito,
  },
  pasoCirculoInactivo: {
    backgroundColor: Colores.borde,
  },
  pasoNumero: {
    fontSize: 13,
    fontWeight: '700',
  },
  pasoNumeroActivo: {
    color: Colores.textoBlanco,
  },
  pasoNumeroInactivo: {
    color: Colores.textoClaro,
  },
  pasoLina: {
    position: 'absolute',
    left: 13,
    top: 28,
    width: 2,
    height: 12,
    backgroundColor: Colores.borde,
  },
  pasoTexto: {
    fontSize: 13,
    flex: 1,
  },
  pasoTextoActivo: {
    fontWeight: '700',
    color: Colores.textoOscuro,
  },
  pasoTextoInactivo: {
    color: Colores.textoClaro,
  },
  // Previsualizacion
  tarxetaPrevisualizacion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colores.fondoTarjeta,
    borderWidth: 1,
    borderColor: Colores.borde,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  previewContido: {
    flex: 1,
  },
  previewFecha: {
    fontSize: 13,
    fontWeight: '600',
    color: Colores.textoOscuro,
  },
  previewDetalle: {
    fontSize: 12,
    color: Colores.textoMedio,
    marginTop: 2,
  },
  badgePteCancelacion: {
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgePteCancelacionTexto: {
    fontSize: 10,
    fontWeight: '600',
    color: '#E8A317',
  },
  // Boton volver
  botonInicio: {
    backgroundColor: Colores.primarioOscuro,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonInicioTexto: {
    color: Colores.textoBlanco,
    fontSize: 16,
    fontWeight: '700',
  },
});
