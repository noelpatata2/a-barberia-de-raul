import React, { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  AppState,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { Colores } from '../constantes/colores';
import { obtenerProximasCitas, obtenerMisCancelaciones } from '../servicios/api';
import { Cita, SolicitudCancelacion, EstadoCancelacion } from '../tipos';
import { useAuth } from '../contexto/AuthContext';
import CitaCard from '../componentes/CitaCard';

// Cores exactas do deseno
const COLORES_DISENO = {
  doradoGradienteInicio: '#D4B96A',
  doradoGradienteFin: '#A07D2E',
  fondoCrema: '#F5F0E8',
  blanco: '#FFFFFF',
  marronAcento: '#8B6914',
  doradoTexto: '#8B6914',
  doradoBorde: '#C8A84E',
  textoOscuro: '#1A1A1A',
  textoGris: '#888888',
  bordeCrema: '#E8E0D0',
};

// Cores de fondo segundo o estado da cancelacion
const coloresEstadoCancelacion: Record<string, { fondo: string; texto: string }> = {
  Pendiente: { fondo: '#FFF3CD', texto: '#8B6914' },
  Aprobada: { fondo: '#DFF0D8', texto: '#3D8B37' },
  Denegada: { fondo: '#F2DEDE', texto: '#C0392B' },
};

export default function MisCitasScreen() {
  const navigation = useNavigation<any>();
  const { cliente, usuario } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cancelaciones, setCancelaciones] = useState<SolicitudCancelacion[]>([]);
  const [cancelacionesOcultas, setCancelacionesOcultas] = useState<Set<string>>(new Set());
  const CLAVE_OCULTAS = 'cancelaciones_ocultas';

  // Cargar cancelacions ocultas desde almacenamento persistente
  useEffect(() => {
    AsyncStorage.getItem(CLAVE_OCULTAS).then((valor) => {
      if (valor) {
        try {
          const datos = JSON.parse(valor);
          setCancelacionesOcultas(new Set(datos));
        } catch {}
      }
    });
  }, []);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarTodasLasCitas, setMostrarTodasLasCitas] = useState(false);

  // Xera unha clave unica para identificar cada cancelacion
  function claveCancelacion(cancelacion: SolicitudCancelacion): string {
    return `${cancelacion.fecha}-${cancelacion.hora}-${cancelacion.fechaSolicitud}`;
  }

  async function cargarCitas() {
    try {
      setError(null);
      const respuesta = await obtenerProximasCitas();
      if (respuesta.exito) {
        setCitas(respuesta.citas);
      } else {
        setError(respuesta.mensaje || 'Erro ao cargar as citas.');
      }
    } catch {
      setError('Erro de conexion. Comproba o teu internet e intentao de novo.');
    }
  }

  async function cargarCancelaciones() {
    try {
      const respuesta = await obtenerMisCancelaciones();
      if (respuesta.exito) {
        setCancelaciones(respuesta.cancelaciones);
      }
    } catch {
      // Silenciar erros de cancelacions para non bloquear a pantalla principal
    }
  }

  // Referencia ao estado anterior de cancelacions para detectar cambios
  const cancelacionesPrevias = useRef<Map<string, EstadoCancelacion>>(new Map());
  const primeiraCaraga = useRef(true);
  const CLAVE_ESTADOS_PREVIOS = 'cancelaciones_estados_previos';

  // Cargar estados previos desde almacenamento persistente
  useEffect(() => {
    AsyncStorage.getItem(CLAVE_ESTADOS_PREVIOS).then((valor) => {
      if (valor) {
        try {
          const datos: [string, EstadoCancelacion][] = JSON.parse(valor);
          cancelacionesPrevias.current = new Map(datos);
        } catch {}
      }
    });
  }, []);

  async function cargarTodo() {
    await Promise.all([cargarCitas(), cargarCancelaciones()]);
  }

  // Detectar cambios de estado en cancelacions e enviar notificacion local
  useEffect(() => {
    // Na primeira carga, so gardamos o estado, non enviamos notificacion
    if (primeiraCaraga.current && cancelaciones.length > 0) {
      primeiraCaraga.current = false;
      // Se non hai estados previos, gardar os actuais como referencia
      if (cancelacionesPrevias.current.size === 0) {
        const mapaInicial = new Map<string, EstadoCancelacion>();
        for (const c of cancelaciones) {
          mapaInicial.set(claveCancelacion(c), c.estado);
        }
        cancelacionesPrevias.current = mapaInicial;
        AsyncStorage.setItem(CLAVE_ESTADOS_PREVIOS, JSON.stringify([...mapaInicial])).catch(() => {});
        return;
      }
    }

    const mapaAnterior = cancelacionesPrevias.current;

    for (const c of cancelaciones) {
      const clave = claveCancelacion(c);
      const estadoAnterior = mapaAnterior.get(clave);

      // Notificar se cambiou de Pendiente a outro estado
      if (estadoAnterior === 'Pendiente' && c.estado !== 'Pendiente') {
        const textoEstado = c.estado === 'Aprobada' ? 'aprobada' : 'denegada';
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Barbería Raúl',
            body: `A tua solicitude de cancelacion do ${c.fecha} as ${c.hora} foi ${textoEstado}.`,
            sound: 'default',
          },
          trigger: null,
        });
      }
    }

    // Actualizar mapa de estados previos e persistir
    const nuevoMapa = new Map<string, EstadoCancelacion>();
    for (const c of cancelaciones) {
      nuevoMapa.set(claveCancelacion(c), c.estado);
    }
    cancelacionesPrevias.current = nuevoMapa;
    AsyncStorage.setItem(CLAVE_ESTADOS_PREVIOS, JSON.stringify([...nuevoMapa])).catch(() => {});
  }, [cancelaciones]);

  // Sondeo periodico cada 30 segundos para detectar cambios
  useEffect(() => {
    const intervalo = setInterval(() => {
      cargarCancelaciones();
      cargarCitas();
    }, 30000);

    const subscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') {
        cargarTodo();
      }
    });

    return () => {
      clearInterval(intervalo);
      subscripcion.remove();
    };
  }, []);

  useEffect(() => {
    cargarTodo().finally(() => setCargando(false));
  }, []);

  const manejarRefrescar = useCallback(async () => {
    setRefrescando(true);
    await cargarTodo();
    setRefrescando(false);
  }, []);

  // Ocultar unha cancelacion aprobada ou denegada (persistente)
  function ocultarCancelacion(cancelacion: SolicitudCancelacion) {
    setCancelacionesOcultas((previas) => {
      const nuevas = new Set(previas);
      nuevas.add(claveCancelacion(cancelacion));
      // Gardar en almacenamento persistente
      AsyncStorage.setItem(CLAVE_OCULTAS, JSON.stringify([...nuevas])).catch(() => {});
      return nuevas;
    });
  }

  // Cancelacions visibles: non ocultas polo usuario e con menos de 1 mes
  const cancelacionesVisibles = cancelaciones.filter((c) => {
    // Ocultar se o usuario xa a descartou
    if (cancelacionesOcultas.has(claveCancelacion(c))) return false;

    // Ocultar se a solicitude ten mais de 1 mes (so as aprobadas/denegadas)
    if (c.estado !== 'Pendiente' && c.fechaSolicitud) {
      try {
        const partes = c.fechaSolicitud.split(' ')[0].split('/');
        if (partes.length === 3) {
          const dataSolicitude = new Date(
            parseInt(partes[2], 10),
            parseInt(partes[1], 10) - 1,
            parseInt(partes[0], 10)
          );
          const hoxe = new Date();
          const unMesAtras = new Date(hoxe.getFullYear(), hoxe.getMonth() - 1, hoxe.getDate());
          if (dataSolicitude < unMesAtras) return false;
        }
      } catch {}
    }

    return true;
  });

  // Mapa de estado de cancelacion por fecha+hora
  const mapaCancelaciones = React.useMemo(() => {
    const mapa = new Map<string, SolicitudCancelacion['estado']>();
    const prioridad: Record<string, number> = { Pendiente: 3, Denegada: 2, Aprobada: 1 };
    for (const c of cancelaciones) {
      const clave = `${c.fecha}-${c.hora}`;
      const existente = mapa.get(clave);
      if (!existente || (prioridad[c.estado] || 0) > (prioridad[existente] || 0)) {
        mapa.set(clave, c.estado);
      }
    }
    return mapa;
  }, [cancelaciones]);

  function esDescartable(cancelacion: SolicitudCancelacion): boolean {
    return cancelacion.estado === 'Aprobada' || cancelacion.estado === 'Denegada';
  }

  // Filtrar citas con cancelacion aprobada
  const citasVisibles = citas.filter((cita) => {
    const estado = mapaCancelaciones.get(`${cita.fecha}-${cita.hora}`);
    return estado !== 'Aprobada';
  });

  // Proxima cita (a primeira da lista)
  const proximaCita = citasVisibles.length > 0 ? citasVisibles[0] : null;

  // Resto de citas
  const restoCitas = citasVisibles.slice(1);

  // Nome do cliente para o saudo
  const nombreCliente = cliente?.nombre || usuario?.nombre || 'Cliente';

  // Calcular o ano do resumo a partir das citas disponibles
  const anioResumen = React.useMemo(() => {
    if (citasVisibles.length === 0) {
      return new Date().getFullYear();
    }
    // Contar a frecuencia de cada ano nas citas
    const conteoAnios: Record<number, number> = {};
    for (const c of citasVisibles) {
      const partes = c.fecha.split('/');
      if (partes.length === 3) {
        const anio = parseInt(partes[2]);
        if (!isNaN(anio)) {
          conteoAnios[anio] = (conteoAnios[anio] || 0) + 1;
        }
      }
    }
    // Devolver o ano mais frecuente
    let anioMasFrecuente = new Date().getFullYear();
    let maxConteo = 0;
    for (const [anio, conteo] of Object.entries(conteoAnios)) {
      if (conteo > maxConteo) {
        maxConteo = conteo;
        anioMasFrecuente = parseInt(anio);
      }
    }
    return anioMasFrecuente;
  }, [citasVisibles]);
  const totalAsignadas = citasVisibles.length;
  const hoy = new Date();
  const citasRealizadas = citasVisibles.filter((c) => {
    const partes = c.fecha.split('/');
    if (partes.length === 3) {
      const fechaCita = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
      return fechaCita < hoy;
    }
    return false;
  }).length;
  const citasPendientes = totalAsignadas - citasRealizadas;

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color={COLORES_DISENO.doradoTexto} />
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.scrollContenido}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={manejarRefrescar}
            colors={[COLORES_DISENO.doradoTexto]}
            tintColor={COLORES_DISENO.doradoTexto}
          />
        }
      >
        {/* Cabeceira con degradado dourado - ocupa ~40% de pantalla */}
        <LinearGradient
          colors={[COLORES_DISENO.doradoGradienteInicio, COLORES_DISENO.doradoGradienteFin]}
          style={estilos.cabecera}
        >
          <Image
            source={require('../../assets/raul.png')}
            style={estilos.fotoBarber}
          />
          <Text style={estilos.cabeceraTexto}>Barbería Raúl</Text>
          <Text style={estilos.cabeceraSubtexto}>A Estrada</Text>
        </LinearGradient>

        {/* Area de contido crema con esquinas superiores redondeadas */}
        <View style={estilos.areaContenido}>

          {/* Saudo */}
          <View style={estilos.seccionSaludo}>
            <Text style={estilos.saludoTexto}>Benvido, {nombreCliente}!</Text>
            <Text style={estilos.saludoSubtexto}>
              {proximaCita ? 'A tua proxima cita esta preto' : 'Non tes citas programadas'}
            </Text>
          </View>

          {/* Banners de estado das cancelacions */}
          {cancelacionesVisibles.length > 0 && (
            <View style={estilos.contenedorCancelaciones}>
              {cancelacionesVisibles.map((cancelacion, indice) => {
                const colores = coloresEstadoCancelacion[cancelacion.estado] || coloresEstadoCancelacion.Pendiente;
                return (
                  <View
                    key={`cancelacion-${indice}-${claveCancelacion(cancelacion)}`}
                    style={[estilos.tarjetaCancelacion, { backgroundColor: colores.fondo }]}
                  >
                    <View style={estilos.contenidoCancelacion}>
                      <Text style={[estilos.textoCancelacion, { color: colores.texto }]}>
                        Cancelacion {cancelacion.fecha} {cancelacion.hora} - {cancelacion.estado}
                      </Text>
                    </View>
                    {esDescartable(cancelacion) && (
                      <TouchableOpacity
                        onPress={() => ocultarCancelacion(cancelacion)}
                        style={estilos.botonCerrar}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close" size={18} color={colores.texto} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Proxima cita - a etiqueta vai dentro da tarxeta via CitaCard */}
          {proximaCita && (
            <View style={estilos.seccionProximaCita}>
              <CitaCard
                cita={proximaCita}
                mostrarCancelar
                onCancelar={() => navigation.navigate('CancelarCita')}
                mostrarReasignar
                onReasignar={() => navigation.navigate('ReasignarCita')}
                estadoCancelacion={mapaCancelaciones.get(`${proximaCita.fecha}-${proximaCita.hora}`)}
                variante="proximaCita"
                etiquetaSuperior="PROXIMA CITA"
              />
            </View>
          )}

          {/* Erro de carga */}
          {error && (
            <View style={estilos.errorContenedor}>
              <Ionicons name="alert-circle-outline" size={24} color={Colores.error} />
              <Text style={estilos.errorTexto}>{error}</Text>
            </View>
          )}

          {/* Resumo anual */}
          <View style={estilos.seccionResumen}>
            <Text style={estilos.tituloSeccion}>Resumo anual {anioResumen}</Text>
            <View style={estilos.filaEstadisticas}>
              <View style={estilos.cajaEstadistica}>
                <View style={estilos.contenidoEstadistica}>
                  <Text style={estilos.numeroEstadistica}>{totalAsignadas}</Text>
                  <Text style={estilos.etiquetaEstadistica}>Asignadas</Text>
                </View>
              </View>
              <View style={estilos.cajaEstadistica}>
                <View style={estilos.contenidoEstadistica}>
                  <Text style={estilos.numeroEstadistica}>{citasRealizadas}</Text>
                  <Text style={estilos.etiquetaEstadistica}>Realizadas</Text>
                </View>
              </View>
              <View style={estilos.cajaEstadistica}>
                <View style={estilos.contenidoEstadistica}>
                  <Text style={estilos.numeroEstadistica}>{citasPendientes}</Text>
                  <Text style={estilos.etiquetaEstadistica}>Pendentes</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Accions rapidas */}
          <View style={estilos.seccionAcciones}>
            <Text style={estilos.tituloSeccion}>Accions rapidas</Text>
            <View style={estilos.cuadriculaAcciones}>
              <TouchableOpacity
                style={estilos.tarjetaAccion}
                onPress={() => navigation.navigate('Citas')}
                activeOpacity={0.7}
              >
                <Text style={estilos.tituloAccion}>Citas Anuais</Text>
                <Text style={estilos.subtituloAccion}>Ver detalle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={estilos.tarjetaAccion}
                onPress={() => navigation.navigate('SolicitarCitaExtra' as never)}
                activeOpacity={0.7}
              >
                <Text style={estilos.tituloAccion}>Cita Extra</Text>
                <Text style={estilos.subtituloAccion}>Solicitar xa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={estilos.tarjetaAccion}
                onPress={() => navigation.navigate('Historial')}
                activeOpacity={0.7}
              >
                <Text style={estilos.tituloAccion}>Historial</Text>
                <Text style={estilos.subtituloAccion}>Visitas previas</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={estilos.tarjetaAccion}
                onPress={() => navigation.navigate('PreferenciasCitas' as never)}
                activeOpacity={0.7}
              >
                <Text style={estilos.tituloAccion}>Preferencias</Text>
                <Text style={estilos.subtituloAccion}>As minas preferencias</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista de todas as citas (expandible dende "Citas Anuais") */}
          {mostrarTodasLasCitas && restoCitas.length > 0 && (
            <View style={estilos.seccionListaCitas}>
              <Text style={estilos.tituloSeccion}>Proximas citas</Text>
              {restoCitas.map((cita, indice) => (
                <CitaCard
                  key={`cita-${cita.fecha}-${cita.hora}-${indice}`}
                  cita={cita}
                  mostrarCancelar
                  onCancelar={() => navigation.navigate('CancelarCita')}
                  estadoCancelacion={mapaCancelaciones.get(`${cita.fecha}-${cita.hora}`)}
                />
              ))}
            </View>
          )}

          {/* Sen citas */}
          {!cargando && citasVisibles.length === 0 && !error && (
            <View style={estilos.vacioContenedor}>
              <Ionicons name="calendar-outline" size={48} color={COLORES_DISENO.textoGris} />
              <Text style={estilos.vacioTitulo}>Sen citas pendentes</Text>
              <Text style={estilos.vacioTexto}>
                Non tes citas programadas. Desliza cara abaixo para actualizar.
              </Text>
            </View>
          )}

          {/* Espaciado inferior */}
          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES_DISENO.doradoGradienteFin,
  },
  scroll: {
    flex: 1,
  },
  scrollContenido: {
    flexGrow: 1,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORES_DISENO.fondoCrema,
  },

  // Cabeceira con degradado dourado (~40% da pantalla)
  cabecera: {
    paddingTop: 60,
    paddingBottom: 48,
    alignItems: 'center',
  },
  fotoBarber: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginBottom: 12,
  },
  cabeceraTexto: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORES_DISENO.blanco,
    marginBottom: 4,
  },
  cabeceraSubtexto: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // Area de contido crema que solapa o degradado
  areaContenido: {
    backgroundColor: COLORES_DISENO.fondoCrema,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    minHeight: 500,
  },

  // Saudo
  seccionSaludo: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  saludoTexto: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORES_DISENO.textoOscuro,
    marginBottom: 4,
  },
  saludoSubtexto: {
    fontSize: 14,
    color: COLORES_DISENO.textoGris,
  },

  // Cancelacions
  contenedorCancelaciones: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  tarjetaCancelacion: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  contenidoCancelacion: {
    flex: 1,
  },
  textoCancelacion: {
    fontSize: 14,
    fontWeight: '500',
  },
  botonCerrar: {
    marginLeft: 8,
    padding: 4,
  },

  // Proxima cita
  seccionProximaCita: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Erro
  errorContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  errorTexto: {
    fontSize: 14,
    color: Colores.error,
    flex: 1,
  },

  // Resumo anual
  seccionResumen: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORES_DISENO.textoOscuro,
    marginBottom: 12,
  },
  filaEstadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cajaEstadistica: {
    flex: 1,
    backgroundColor: COLORES_DISENO.blanco,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  contenidoEstadistica: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  numeroEstadistica: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORES_DISENO.marronAcento,
    marginBottom: 2,
  },
  etiquetaEstadistica: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORES_DISENO.textoGris,
  },

  // Accions rapidas
  seccionAcciones: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  cuadriculaAcciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  tarjetaAccion: {
    width: '47%',
    backgroundColor: COLORES_DISENO.blanco,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORES_DISENO.bordeCrema,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  tituloAccion: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORES_DISENO.textoOscuro,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtituloAccion: {
    fontSize: 12,
    color: COLORES_DISENO.textoGris,
    textAlign: 'center',
  },

  // Lista de citas expandible
  seccionListaCitas: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Sen citas
  vacioContenedor: {
    paddingVertical: 40,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  vacioTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORES_DISENO.textoOscuro,
    marginTop: 16,
  },
  vacioTexto: {
    fontSize: 14,
    color: COLORES_DISENO.textoGris,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});
