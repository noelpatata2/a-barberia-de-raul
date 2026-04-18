import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colores } from '../constantes/colores';
import { obtenerProximasCitas, solicitarCancelacion } from '../servicios/api';
import { Cita } from '../tipos';

// Motivos de cancelacion disponibles
const MOTIVOS = [
  'Traballo / Compromiso',
  'Viaxe',
  'Problema de saude',
  'Outro motivo',
];

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

// Calcular dias que faltan ata a cita
function calcularDiasFaltan(fechaStr: string): number {
  const partes = fechaStr.split('/');
  const fechaCita = new Date(
    parseInt(partes[2]),
    parseInt(partes[1]) - 1,
    parseInt(partes[0])
  );
  const hoxe = new Date();
  hoxe.setHours(0, 0, 0, 0);
  const diferencia = fechaCita.getTime() - hoxe.getTime();
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

// Formatear fecha en galego: "Martes, 15 Abril 2025"
function formatearFechaGalego(cita: Cita): string {
  const diaGalego = DIAS_GALEGO[cita.dia] || cita.dia;
  const partes = cita.fecha.split('/');
  const mes = MESES_GALEGO[parseInt(partes[1]) - 1];
  const ano = partes[2];
  const dia = parseInt(partes[0]);
  return `${diaGalego}, ${dia} ${mes} ${ano}`;
}

export default function CancelarCitaScreen({ navigation }: any) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [citaSeleccionada, setCitaSeleccionada] = useState<number | null>(null);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarCitas();
  }, []);

  async function cargarCitas() {
    try {
      setCargando(true);
      const resposta = await obtenerProximasCitas();
      if (resposta.exito) {
        setCitas(resposta.citas.slice(0, 3));
      }
    } catch (erro) {
      console.error('Erro ao cargar citas:', erro);
    } finally {
      setCargando(false);
    }
  }

  async function enviarSolicitude() {
    if (citaSeleccionada === null || motivoSeleccionado === null) {
      Alert.alert('Atencion', 'Selecciona unha cita e un motivo de cancelacion.');
      return;
    }

    const cita = citas[citaSeleccionada];
    const motivo = MOTIVOS[motivoSeleccionado];

    try {
      setEnviando(true);
      const resposta = await solicitarCancelacion(cita.fecha, cita.hora, cita.servicio);
      if (resposta.exito) {
        navigation.replace('SolicitudeEnviada', { cita, motivo });
      } else {
        Alert.alert('Erro', resposta.mensaje || 'Non se puido enviar a solicitude.');
      }
    } catch (erro) {
      Alert.alert('Erro', 'Ocorreu un erro ao enviar a solicitude. Intentao de novo.');
    } finally {
      setEnviando(false);
    }
  }

  const podeEnviar = citaSeleccionada !== null && motivoSeleccionado !== null && !enviando;

  return (
    <View style={estilos.contenedor}>
      {/* Cabeceira */}
      <View style={estilos.cabeceira}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.botonVoltar}>
          <Ionicons name="chevron-back" size={24} color={Colores.textoOscuro} />
        </TouchableOpacity>
        <View style={estilos.cabeceiraTextos}>
          <Text style={estilos.tituloCabeceira}>Cancelar Cita</Text>
          <Text style={estilos.subtituloCabeceira}>Selecciona a cita a cancelar</Text>
        </View>
      </View>

      <ScrollView style={estilos.scroll} contentContainerStyle={estilos.scrollContido}>
        {/* Banner de advertencia */}
        <View style={estilos.bannerAdvertencia}>
          <Ionicons name="alert-circle-outline" size={20} color={Colores.advertencia} />
          <Text style={estilos.textoBanner}>
            A tua solicitude sera revisada polo xerente antes de ser confirmada.
          </Text>
        </View>

        {/* Seccion: Citas cancelables */}
        <Text style={estilos.tituloSeccion}>Citas cancelables</Text>

        {cargando ? (
          <ActivityIndicator size="large" color={Colores.primarioClaro} style={{ marginVertical: 24 }} />
        ) : citas.length === 0 ? (
          <View style={estilos.tarxetaVacia}>
            <Text style={estilos.textoVacio}>Non tes citas futuras para cancelar.</Text>
          </View>
        ) : (
          citas.map((cita, indice) => {
            const seleccionada = citaSeleccionada === indice;
            const diasFaltan = calcularDiasFaltan(cita.fecha);
            return (
              <TouchableOpacity
                key={`${cita.fecha}-${cita.hora}-${indice}`}
                style={[
                  estilos.tarxetaCita,
                  seleccionada && estilos.tarxetaCitaSeleccionada,
                ]}
                onPress={() => setCitaSeleccionada(indice)}
                activeOpacity={0.7}
              >
                {/* Radio */}
                <View style={[estilos.radio, seleccionada && estilos.radioSeleccionado]}>
                  {seleccionada && <View style={estilos.radioPunto} />}
                </View>
                {/* Contido da cita */}
                <View style={estilos.citaContido}>
                  <Text style={estilos.citaFecha}>{formatearFechaGalego(cita)}</Text>
                  <Text style={estilos.citaDetalle}>
                    {cita.hora}h - {cita.servicio}
                  </Text>
                  {diasFaltan > 0 && (
                    <View style={estilos.badgeDias}>
                      <Text style={estilos.badgeDiasTexto}>
                        Faltan {diasFaltan} {diasFaltan === 1 ? 'dia' : 'dias'}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Seccion: Motivo da cancelacion */}
        <Text style={[estilos.tituloSeccion, { marginTop: 24 }]}>Motivo da cancelacion</Text>

        {MOTIVOS.map((motivo, indice) => {
          const seleccionado = motivoSeleccionado === indice;
          return (
            <TouchableOpacity
              key={motivo}
              style={[
                estilos.tarxetaMotivo,
                seleccionado && estilos.tarxetaMotivoSeleccionado,
              ]}
              onPress={() => setMotivoSeleccionado(indice)}
              activeOpacity={0.7}
            >
              <View style={[estilos.radio, seleccionado && estilos.radioSeleccionado]}>
                {seleccionado && <View style={estilos.radioPunto} />}
              </View>
              <Text style={estilos.motivoTexto}>{motivo}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Caixa de informacion */}
        <View style={estilos.caixaInfo}>
          <Text style={estilos.caixaInfoTitulo}>Que ocorre ao solicitar:</Text>
          <View style={estilos.caixaInfoPaso}>
            <Text style={estilos.caixaInfoNumero}>1.</Text>
            <Text style={estilos.caixaInfoTexto}>A cita pasa a "Pendente de cancelacion"</Text>
          </View>
          <View style={estilos.caixaInfoPaso}>
            <Text style={estilos.caixaInfoNumero}>2.</Text>
            <Text style={estilos.caixaInfoTexto}>O xerente revisaraa e confirmara.</Text>
          </View>
        </View>

        {/* Boton de enviar */}
        <TouchableOpacity
          style={[estilos.botonEnviar, !podeEnviar && estilos.botonDeshabilitado]}
          onPress={enviarSolicitude}
          disabled={!podeEnviar}
          activeOpacity={0.8}
        >
          {enviando ? (
            <ActivityIndicator size="small" color={Colores.textoBlanco} />
          ) : (
            <Text style={estilos.botonEnviarTexto}>Solicitar cancelacion</Text>
          )}
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
  cabeceiraTextos: {
    flex: 1,
  },
  tituloCabeceira: {
    fontSize: 20,
    fontWeight: '700',
    color: Colores.textoOscuro,
  },
  subtituloCabeceira: {
    fontSize: 14,
    color: Colores.textoClaro,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContido: {
    padding: 16,
    paddingBottom: 32,
  },
  // Banner de advertencia
  bannerAdvertencia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: Colores.primarioClaro,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  textoBanner: {
    flex: 1,
    fontSize: 13,
    color: Colores.primarioOscuro,
    lineHeight: 18,
  },
  // Seccion
  tituloSeccion: {
    fontSize: 16,
    fontWeight: '700',
    color: Colores.textoOscuro,
    marginBottom: 12,
  },
  // Tarxeta de cita
  tarxetaCita: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colores.fondoTarjeta,
    borderWidth: 1.5,
    borderColor: Colores.borde,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  tarxetaCitaSeleccionada: {
    borderColor: Colores.primarioClaro,
  },
  citaContido: {
    flex: 1,
    marginLeft: 12,
  },
  citaFecha: {
    fontSize: 15,
    fontWeight: '700',
    color: Colores.textoOscuro,
  },
  citaDetalle: {
    fontSize: 13,
    color: Colores.textoMedio,
    marginTop: 3,
  },
  badgeDias: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  badgeDiasTexto: {
    fontSize: 11,
    color: Colores.primarioOscuro,
    fontWeight: '600',
  },
  // Radio
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colores.borde,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  radioSeleccionado: {
    borderColor: Colores.primarioClaro,
  },
  radioPunto: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colores.primarioClaro,
  },
  // Tarxeta de motivo
  tarxetaMotivo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colores.fondoTarjeta,
    borderWidth: 1.5,
    borderColor: Colores.borde,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  tarxetaMotivoSeleccionado: {
    borderColor: Colores.primarioClaro,
  },
  motivoTexto: {
    fontSize: 14,
    color: Colores.textoOscuro,
    marginLeft: 12,
    fontWeight: '500',
  },
  // Caixa de informacion
  caixaInfo: {
    backgroundColor: '#FFF8E7',
    borderRadius: 10,
    padding: 14,
    marginTop: 20,
    marginBottom: 20,
  },
  caixaInfoTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: Colores.textoOscuro,
    marginBottom: 10,
  },
  caixaInfoPaso: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  caixaInfoNumero: {
    fontSize: 13,
    color: Colores.textoMedio,
    fontWeight: '600',
    marginRight: 6,
  },
  caixaInfoTexto: {
    fontSize: 13,
    color: Colores.textoMedio,
    flex: 1,
    lineHeight: 18,
  },
  // Boton enviar
  botonEnviar: {
    backgroundColor: Colores.primarioOscuro,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  botonEnviarTexto: {
    color: Colores.textoBlanco,
    fontSize: 16,
    fontWeight: '700',
  },
  // Estado vacio
  tarxetaVacia: {
    backgroundColor: Colores.fondoTarjeta,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  textoVacio: {
    fontSize: 14,
    color: Colores.textoClaro,
  },
});
