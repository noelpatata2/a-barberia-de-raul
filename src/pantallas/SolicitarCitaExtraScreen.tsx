import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colores } from '../constantes/colores';
import { solicitarCitaExtra, obtenerCitasPorFecha } from '../servicios/api';

// Nomes dos dias da semana en galego
const DIAS_SEMANA_GALEGO = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const NOMES_MESES_GALEGO = [
  'Xaneiro', 'Febreiro', 'Marzo', 'Abril', 'Maio', 'Xuno',
  'Xullo', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Decembro',
];
const NOMES_DIAS_GALEGO = [
  'Domingo', 'Luns', 'Martes', 'Mercores', 'Xoves', 'Venres', 'Sabado',
];

// Tipos de servizo disponibles
const SERVIZOS = [
  { id: 'corte', etiqueta: 'Corte de pelo' },
  { id: 'corte_barba', etiqueta: 'Corte + Barba' },
  { id: 'barba', etiqueta: 'So Barba' },
];


function obterDiasDoMes(ano: number, mes: number) {
  return new Date(ano, mes + 1, 0).getDate();
}

function obterPrimeiroDiaSemana(ano: number, mes: number) {
  // 0=Domingo, convertir a 0=Luns
  const dia = new Date(ano, mes, 1).getDay();
  return dia === 0 ? 6 : dia - 1;
}

export default function SolicitarCitaExtraScreen() {
  const navigation = useNavigation<any>();

  const hoxe = new Date();
  hoxe.setHours(0, 0, 0, 0);

  // Data inicial: 1 de xaneiro de 2027 se estamos antes, senon a data actual
  const dataInicio = new Date(2027, 0, 1);
  const dataInicialCalendario = hoxe < dataInicio ? dataInicio : hoxe;

  const [servizoSeleccionado, setServizoSeleccionado] = useState('corte');
  const [mesActual, setMesActual] = useState(dataInicialCalendario.getMonth());
  const [anoActual, setAnoActual] = useState(dataInicialCalendario.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);
  const [nota, setNota] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [franxasHorarias, setFranxasHorarias] = useState<{hora: string; disponible: boolean}[]>([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);

  // Cargar citas de TODOS os clientes para o dia seleccionado
  useEffect(() => {
    if (!diaSeleccionado) {
      setFranxasHorarias([]);
      return;
    }

    const fechaFormateada = ('0' + diaSeleccionado).slice(-2) + '/' + ('0' + (mesActual + 1)).slice(-2) + '/' + anoActual;

    async function cargarCitasDoDia() {
      setCargandoHoras(true);
      try {
        const resposta = await obtenerCitasPorFecha(fechaFormateada);
        if (resposta.exito) {
          const franxas = resposta.citas.map((cita: any) => ({
            hora: cita.hora,
            disponible: cita.estado === 'libre',
          }));
          setFranxasHorarias(franxas);
        } else {
          setFranxasHorarias([]);
        }
      } catch {
        // Silenciar erros
        setFranxasHorarias([]);
      } finally {
        setCargandoHoras(false);
      }
    }
    cargarCitasDoDia();
  }, [diaSeleccionado, mesActual, anoActual]);

  // Calcular dias do calendario
  const diasCalendario = useMemo(() => {
    const totalDias = obterDiasDoMes(anoActual, mesActual);
    const primeiroDia = obterPrimeiroDiaSemana(anoActual, mesActual);
    const celas: (number | null)[] = [];

    // Celas baleiras antes do primeiro dia
    for (let i = 0; i < primeiroDia; i++) {
      celas.push(null);
    }
    for (let d = 1; d <= totalDias; d++) {
      celas.push(d);
    }
    return celas;
  }, [mesActual, anoActual]);

  function eDiaPasado(dia: number): boolean {
    const fecha = new Date(anoActual, mesActual, dia);
    fecha.setHours(0, 0, 0, 0);
    return fecha < hoxe;
  }

  function eHoxe(dia: number): boolean {
    return (
      dia === hoxe.getDate() &&
      mesActual === hoxe.getMonth() &&
      anoActual === hoxe.getFullYear()
    );
  }

  function mesAnterior() {
    if (mesActual === 0) {
      setMesActual(11);
      setAnoActual(anoActual - 1);
    } else {
      setMesActual(mesActual - 1);
    }
    setDiaSeleccionado(null);
  }

  function mesSeguinte() {
    if (mesActual === 11) {
      setMesActual(0);
      setAnoActual(anoActual + 1);
    } else {
      setMesActual(mesActual + 1);
    }
    setDiaSeleccionado(null);
  }

  function formatearFecha(): string {
    if (!diaSeleccionado) return '';
    const d = ('0' + diaSeleccionado).slice(-2);
    const m = ('0' + (mesActual + 1)).slice(-2);
    return `${d}/${m}/${anoActual}`;
  }

  function obterNomeServizo(): string {
    const servizo = SERVIZOS.find((s) => s.id === servizoSeleccionado);
    return servizo ? servizo.etiqueta : '';
  }

  async function enviarSolicitude() {
    if (!diaSeleccionado) {
      Alert.alert('Atencion', 'Selecciona un dia para a cita.');
      return;
    }
    if (!horaSeleccionada) {
      Alert.alert('Atencion', 'Selecciona unha hora para a cita.');
      return;
    }

    setEnviando(true);
    try {
      const fecha = formatearFecha();
      const resposta = await solicitarCitaExtra(
        obterNomeServizo(),
        fecha,
        horaSeleccionada,
        nota
      );

      if (resposta.exito) {
        // Construir datos da solicitude para a pantalla de confirmacion
        const fechaObj = new Date(anoActual, mesActual, diaSeleccionado);
        const nomeDia = NOMES_DIAS_GALEGO[fechaObj.getDay()];
        const nomeMes = NOMES_MESES_GALEGO[mesActual];
        const fechaFormateada = `${nomeDia}, ${diaSeleccionado} ${nomeMes} ${anoActual}`;

        navigation.navigate('SolicitudCitaEnviada', {
          servizo: obterNomeServizo(),
          fechaTexto: fechaFormateada,
          hora: horaSeleccionada,
        });
      } else {
        Alert.alert('Erro', resposta.mensaje || 'Non se puido enviar a solicitude.');
      }
    } catch {
      Alert.alert('Erro', 'Erro de conexion. Comproba a tua internet.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={estilos.contenedor}>
      {/* Cabeceira */}
      <View style={estilos.cabeceira}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={estilos.botonVolver}
        >
          <Ionicons name="chevron-back" size={24} color={Colores.textoOscuro} />
        </TouchableOpacity>
        <View style={estilos.cabeceiraTextos}>
          <Text style={estilos.cabeceiraTitulo}>Solicitar Cita Extra</Text>
          <Text style={estilos.cabeceiraSubtitulo}>
            Selecciona servizo, dia e hora
          </Text>
        </View>
      </View>

      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.scrollContido}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner de aviso */}
        <View style={estilos.bannerAviso}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#8B6914"
            style={{ marginRight: 8 }}
          />
          <Text style={estilos.bannerAvisoTexto}>
            A cita quedara pendente de confirmacion por parte da xerencia.
          </Text>
        </View>

        {/* Tipo de servizo */}
        <Text style={estilos.seccionTitulo}>Tipo de servizo</Text>
        {SERVIZOS.map((servizo) => {
          const seleccionado = servizoSeleccionado === servizo.id;
          return (
            <TouchableOpacity
              key={servizo.id}
              style={[
                estilos.opcionServizo,
                seleccionado && estilos.opcionServizoSeleccionada,
              ]}
              onPress={() => setServizoSeleccionado(servizo.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  estilos.radioExterior,
                  seleccionado && estilos.radioExteriorSeleccionado,
                ]}
              >
                {seleccionado && <View style={estilos.radioInterior} />}
              </View>
              <Text
                style={[
                  estilos.opcionServizoTexto,
                  seleccionado && estilos.opcionServizoTextoSeleccionado,
                ]}
              >
                {servizo.etiqueta}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Selecciona o dia */}
        <Text style={estilos.seccionTitulo}>Selecciona o dia</Text>
        <View style={estilos.calendarioContenedor}>
          {/* Cabeceira do mes */}
          <View style={estilos.calendarioCabeceira}>
            <TouchableOpacity onPress={mesAnterior} style={estilos.calendarioFreccia}>
              <Ionicons name="chevron-back" size={22} color={Colores.textoOscuro} />
            </TouchableOpacity>
            <Text style={estilos.calendarioMesTitulo}>
              {NOMES_MESES_GALEGO[mesActual]} {anoActual}
            </Text>
            <TouchableOpacity onPress={mesSeguinte} style={estilos.calendarioFreccia}>
              <Ionicons name="chevron-forward" size={22} color={Colores.textoOscuro} />
            </TouchableOpacity>
          </View>

          {/* Dias da semana */}
          <View style={estilos.calendarioFilaDias}>
            {DIAS_SEMANA_GALEGO.map((dia, indice) => (
              <Text key={indice} style={estilos.calendarioDiaSemana}>
                {dia}
              </Text>
            ))}
          </View>

          {/* Grella de dias */}
          <View style={estilos.calendarioGrella}>
            {diasCalendario.map((dia, indice) => {
              if (dia === null) {
                return <View key={`vacio-${indice}`} style={estilos.calendarioCela} />;
              }
              const pasado = eDiaPasado(dia);
              const hoxeEste = eHoxe(dia);
              const seleccionado = diaSeleccionado === dia;

              return (
                <TouchableOpacity
                  key={`dia-${dia}`}
                  style={estilos.calendarioCela}
                  onPress={() => { if (!pasado) { setDiaSeleccionado(dia); setHoraSeleccionada(null); } }}
                  disabled={pasado}
                  activeOpacity={0.6}
                >
                  <View
                    style={[
                      estilos.calendarioDiaCirculo,
                      seleccionado && estilos.calendarioCelaSeleccionada,
                      hoxeEste && !seleccionado && estilos.calendarioCelaHoxe,
                    ]}
                  >
                    <Text
                      style={[
                        estilos.calendarioDiaTexto,
                        pasado && estilos.calendarioDiaPasado,
                        seleccionado && estilos.calendarioDiaTextoSeleccionado,
                      ]}
                    >
                      {dia}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Horas disponibles */}
        <Text style={estilos.seccionTitulo}>Horas disponibles</Text>
        {!diaSeleccionado ? (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Text style={{ color: Colores.textoMedio, fontSize: 14 }}>
              Selecciona un dia para ver as horas disponibles
            </Text>
          </View>
        ) : cargandoHoras ? (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <ActivityIndicator size="large" color="#C8A84E" />
            <Text style={{ color: Colores.textoMedio, marginTop: 8, fontSize: 14 }}>
              Comprobando dispoñibilidade...
            </Text>
          </View>
        ) : franxasHorarias.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Text style={{ color: Colores.textoMedio, fontSize: 14 }}>
              Non hai franxas horarias para este dia
            </Text>
          </View>
        ) : (
        <View style={estilos.grellaHoras}>
          {franxasHorarias.map((franxa) => {
            const seleccionada = horaSeleccionada === franxa.hora;
            return (
              <TouchableOpacity
                key={franxa.hora}
                style={[
                  estilos.horaSlot,
                  !franxa.disponible && estilos.horaSlotCheo,
                  seleccionada && estilos.horaSlotSeleccionada,
                ]}
                onPress={() => franxa.disponible && setHoraSeleccionada(franxa.hora)}
                disabled={!franxa.disponible}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    estilos.horaSlotTexto,
                    !franxa.disponible && estilos.horaSlotTextoCheo,
                    seleccionada && estilos.horaSlotTextoSeleccionada,
                  ]}
                >
                  {franxa.hora}
                </Text>
                {!franxa.disponible && (
                  <Text style={estilos.horaSlotCheoLabel}>Cheo</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        )}

        {/* Nota opcional */}
        <Text style={estilos.seccionTitulo}>Nota opcional</Text>
        <TextInput
          style={estilos.inputNota}
          placeholder="Teño que cortar o pelo para unha voda"
          placeholderTextColor={Colores.textoClaro}
          value={nota}
          onChangeText={setNota}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Boton enviar */}
        <TouchableOpacity
          style={[estilos.botonEnviar, enviando && { opacity: 0.7 }]}
          onPress={enviarSolicitude}
          disabled={enviando}
          activeOpacity={0.8}
        >
          {enviando ? (
            <ActivityIndicator color={Colores.textoBlanco} />
          ) : (
            <Text style={estilos.botonEnviarTexto}>Enviar solicitude de cita</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
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
  botonVolver: {
    padding: 4,
    marginRight: 8,
  },
  cabeceiraTextos: {
    flex: 1,
  },
  cabeceiraTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: Colores.textoOscuro,
  },
  cabeceiraSubtitulo: {
    fontSize: 14,
    color: Colores.textoMedio,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContido: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Banner de aviso
  bannerAviso: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  bannerAvisoTexto: {
    flex: 1,
    fontSize: 13,
    color: '#8B6914',
    lineHeight: 18,
  },

  // Seccion titulo
  seccionTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: Colores.textoOscuro,
    marginBottom: 10,
    marginTop: 8,
  },

  // Opcions de servizo
  opcionServizo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colores.fondoTarjeta,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: Colores.borde,
  },
  opcionServizoSeleccionada: {
    borderColor: '#C8A84E',
    backgroundColor: '#FFFDF5',
  },
  radioExterior: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colores.textoClaro,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioExteriorSeleccionado: {
    borderColor: '#C8A84E',
  },
  radioInterior: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C8A84E',
  },
  opcionServizoTexto: {
    fontSize: 15,
    color: Colores.textoOscuro,
  },
  opcionServizoTextoSeleccionado: {
    fontWeight: '600',
  },

  // Calendario
  calendarioContenedor: {
    backgroundColor: Colores.fondoTarjeta,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colores.borde,
  },
  calendarioCabeceira: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarioFreccia: {
    padding: 4,
  },
  calendarioMesTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: Colores.textoOscuro,
  },
  calendarioFilaDias: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calendarioDiaSemana: {
    width: 40,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: Colores.textoMedio,
  },
  calendarioGrella: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarioCela: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarioDiaCirculo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarioCelaSeleccionada: {
    backgroundColor: '#1A1A1A',
  },
  calendarioCelaHoxe: {
    borderWidth: 2,
    borderColor: '#C8A84E',
  },
  calendarioDiaTexto: {
    fontSize: 15,
    color: Colores.textoOscuro,
  },
  calendarioDiaPasado: {
    color: '#CCCCCC',
  },
  calendarioDiaTextoSeleccionado: {
    color: Colores.textoBlanco,
    fontWeight: '700',
  },

  // Horas
  grellaHoras: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  horaSlot: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colores.borde,
    backgroundColor: Colores.fondoTarjeta,
    alignItems: 'center',
    marginBottom: 10,
  },
  horaSlotCheo: {
    backgroundColor: '#F5F0E8',
    borderColor: '#E8E0D0',
    opacity: 0.7,
  },
  horaSlotSeleccionada: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  horaSlotTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: Colores.textoOscuro,
  },
  horaSlotTextoCheo: {
    color: Colores.textoClaro,
  },
  horaSlotTextoSeleccionada: {
    color: Colores.textoBlanco,
  },
  horaSlotCheoLabel: {
    fontSize: 11,
    color: Colores.textoClaro,
    marginTop: 2,
  },

  // Nota
  inputNota: {
    backgroundColor: '#FFF8E7',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: Colores.textoOscuro,
    minHeight: 80,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colores.borde,
  },

  // Boton enviar
  botonEnviar: {
    backgroundColor: '#6B4F0E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonEnviarTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: Colores.textoBlanco,
  },
});
