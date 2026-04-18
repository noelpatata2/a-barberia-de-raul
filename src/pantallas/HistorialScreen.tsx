import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colores } from '../constantes/colores';
import { obtenerHistorialCitas } from '../servicios/api';
import { Cita } from '../tipos';

// Nomes dos meses en galego
const NOMES_MESES = [
  'Xaneiro', 'Febreiro', 'Marzo', 'Abril', 'Maio', 'Xuno',
  'Xullo', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Decembro',
];

// Extraer o ano dunha data en formato DD/MM/YYYY
function obterAno(data: string): number {
  const partes = data.split('/');
  return partes.length === 3 ? parseInt(partes[2], 10) : 0;
}

// Formatear data de DD/MM/YYYY a "Maio 6, 2025"
function formatearData(data: string): string {
  const partes = data.split('/');
  if (partes.length !== 3) return data;
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const ano = partes[2];
  return `${NOMES_MESES[mes]} ${dia}, ${ano}`;
}

// Obter anos unicos das citas, ordenados de maior a menor
function obterAnosDisponibles(citas: Cita[]): number[] {
  const anos = new Set<number>();
  for (const cita of citas) {
    const ano = obterAno(cita.fecha);
    if (ano > 0) anos.add(ano);
  }
  if (anos.size === 0) {
    anos.add(new Date().getFullYear());
  }
  return Array.from(anos).sort((a, b) => b - a);
}

// Filtrar citas por ano
function filtrarPorAno(citas: Cita[], ano: number): Cita[] {
  return citas.filter((cita) => obterAno(cita.fecha) === ano);
}

// Ordenar citas por data descendente (mais recentes primeiro)
function ordenarPorData(citas: Cita[]): Cita[] {
  return [...citas].sort((a, b) => {
    const partesA = a.fecha.split('/');
    const partesB = b.fecha.split('/');
    const dataA = new Date(
      parseInt(partesA[2], 10),
      parseInt(partesA[1], 10) - 1,
      parseInt(partesA[0], 10)
    );
    const dataB = new Date(
      parseInt(partesB[2], 10),
      parseInt(partesB[1], 10) - 1,
      parseInt(partesB[0], 10)
    );
    return dataB.getTime() - dataA.getTime();
  });
}

// Comprobar se unha cita esta cancelada
function estaCancelada(cita: Cita): boolean {
  if (!cita.estado) return false;
  const estado = cita.estado.toString().toLowerCase().trim();
  return estado === 'cancelada' || estado === 'cancelado';
}

export default function HistorialScreen() {
  const navegacion = useNavigation();
  const [todasCitas, setTodasCitas] = useState<Cita[]>([]);
  const [anoSeleccionado, setAnoSeleccionado] = useState<number>(
    new Date().getFullYear()
  );
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Anos disponibles para os filtros
  const anosDisponibles = useMemo(
    () => obterAnosDisponibles(todasCitas),
    [todasCitas]
  );

  // Citas filtradas polo ano seleccionado
  const citasFiltradas = useMemo(
    () => ordenarPorData(filtrarPorAno(todasCitas, anoSeleccionado)),
    [todasCitas, anoSeleccionado]
  );

  // Estatisticas do ano seleccionado
  const estatisticas = useMemo(() => {
    const total = citasFiltradas.length;
    const canceladas = citasFiltradas.filter((c) => estaCancelada(c)).length;
    const completadas = total - canceladas;
    return { total, completadas, canceladas };
  }, [citasFiltradas]);

  async function cargarHistorial() {
    try {
      setErro(null);
      const resposta = await obtenerHistorialCitas();
      if (resposta.exito) {
        setTodasCitas(resposta.citas);
      } else {
        setErro(resposta.mensaje || 'Erro ao cargar o historial.');
      }
    } catch {
      setErro('Erro de conexion. Comproba a tua internet e intentao de novo.');
    }
  }

  useEffect(() => {
    cargarHistorial().finally(() => setCargando(false));
  }, []);

  const manejarRefrescar = useCallback(async () => {
    setRefrescando(true);
    await cargarHistorial();
    setRefrescando(false);
  }, []);

  // Formatear importe para mostrar
  function formatearImporte(cita: Cita): string {
    if (cita.importe) {
      const importeStr = cita.importe.toString().trim();
      if (importeStr.toUpperCase().includes('EUR')) return importeStr;
      return `${importeStr} EUR`;
    }
    return '';
  }

  // Determinar se o ano e o actual para a cor do borde esquerdo
  const anoActual = new Date().getFullYear();

  // Renderizar cada fila de cita do historial
  function renderizarCita({ item, index }: { item: Cita; index: number }) {
    const esAnoActual = obterAno(item.fecha) === anoActual;
    const esUltimoElemento = index === citasFiltradas.length - 1;
    const cancelada = estaCancelada(item);

    return (
      <View style={[
        estilos.citaFila,
        index === 0 && estilos.citaFilaPrimera,
        esUltimoElemento && estilos.citaFilaUltima,
      ]}>
        <View
          style={[
            estilos.citaBordeIzquierdo,
            { backgroundColor: cancelada ? '#C0392B' : esAnoActual ? '#C8A84E' : '#D4C5A0' },
          ]}
        />
        <View style={[
          estilos.citaContenido,
          esUltimoElemento && estilos.citaContenidoSinBorde,
        ]}>
          <View style={estilos.citaInfo}>
            <Text style={[estilos.citaFecha, cancelada && estilos.citaFechaCancelada]}>
              {formatearData(item.fecha)}
            </Text>
            <Text style={estilos.citaServicio}>{item.servicio}</Text>
            {cancelada && (
              <Text style={estilos.citaCanceladaTexto}>Cancelada</Text>
            )}
          </View>
          <View style={estilos.citaPrecioContenedor}>
            <Text style={[estilos.citaPrecio, cancelada && estilos.citaPrezioCancelado]}>
              {formatearImporte(item)}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Cabeceira da lista (filtros de ano + estatisticas + titulo seccion)
  function renderizarCabeceira() {
    return (
      <View>
        {/* Filtros de ano */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={estilos.filtrosContenedor}
        >
          {anosDisponibles.map((ano) => (
            <TouchableOpacity
              key={ano}
              style={[
                estilos.filtroPastilla,
                ano === anoSeleccionado && estilos.filtroPastillaActiva,
              ]}
              onPress={() => setAnoSeleccionado(ano)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  estilos.filtroPastillaTexto,
                  ano === anoSeleccionado && estilos.filtroPastillaTextoActivo,
                ]}
              >
                {ano}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Estatisticas */}
        <View style={estilos.estadisticasFila}>
          <View style={estilos.estadisticaCaja}>
            <Text style={estilos.estadisticaNumero}>{estatisticas.total}</Text>
            <Text style={estilos.estadisticaEtiqueta}>Total</Text>
          </View>
          <View style={estilos.estadisticaCaja}>
            <Text style={[estilos.estadisticaNumero, { color: '#3D8B37' }]}>
              {estatisticas.completadas}
            </Text>
            <Text style={[estilos.estadisticaEtiqueta, { color: '#3D8B37' }]}>
              Completadas
            </Text>
          </View>
          <View style={estilos.estadisticaCaja}>
            <Text style={[estilos.estadisticaNumero, { color: '#C0392B' }]}>
              {estatisticas.canceladas}
            </Text>
            <Text style={[estilos.estadisticaEtiqueta, { color: '#C0392B' }]}>
              Canceladas
            </Text>
          </View>
        </View>

        {/* Titulo da seccion de visitas */}
        <Text style={estilos.seccionTitulo}>Todas as visitas</Text>
      </View>
    );
  }

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color={Colores.primario} />
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      {/* Cabeceira branca */}
      <View style={estilos.cabeceira}>
        <TouchableOpacity
          onPress={() => navegacion.goBack()}
          style={estilos.botonAtras}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={Colores.textoOscuro} />
        </TouchableOpacity>
        <Text style={estilos.cabeceiraTitulo}>Historial de Citas</Text>
        {/* Espazo baleiro para equilibrar a frecha da esquerda */}
        <View style={{ width: 40 }} />
      </View>

      {/* Lista de citas con cabeceira (filtros + estatisticas) */}
      <FlatList
        data={citasFiltradas}
        keyExtractor={(item, indice) => `${item.fecha}-${item.hora}-${indice}`}
        renderItem={renderizarCita}
        ListHeaderComponent={renderizarCabeceira}
        contentContainerStyle={
          citasFiltradas.length === 0 ? estilos.listaBaleira : estilos.lista
        }
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={manejarRefrescar}
            colors={[Colores.primario]}
          />
        }
        ListEmptyComponent={
          <View style={estilos.baleiroContenedor}>
            {erro ? (
              <>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color={Colores.error}
                />
                <Text style={estilos.baleiroTexto}>{erro}</Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="time-outline"
                  size={48}
                  color={Colores.textoClaro}
                />
                <Text style={estilos.baleiroTitulo}>Sen historial</Text>
                <Text style={estilos.baleiroTexto}>
                  Non hai citas rexistradas para {anoSeleccionado}.
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0E8',
  },

  // Cabeceira - fondo branco, sen degradado
  cabeceira: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  botonAtras: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cabeceiraTitulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  // Filtros de ano - pastillas horizontais
  filtrosContenedor: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 10,
  },
  filtroPastilla: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filtroPastillaActiva: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  filtroPastillaTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999999',
  },
  filtroPastillaTextoActivo: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Estatisticas - 3 caixas lado a lado
  estadisticasFila: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  estadisticaCaja: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E0D0',
  },
  estadisticaNumero: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  estadisticaEtiqueta: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999999',
    marginTop: 4,
  },

  // Titulo de seccion
  seccionTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },

  // Lista
  lista: {
    paddingBottom: 24,
  },
  listaBaleira: {
    flexGrow: 1,
  },

  // Filas de citas do historial
  citaFila: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  citaFilaPrimera: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  citaFilaUltima: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  citaBordeIzquierdo: {
    width: 4,
  },
  citaContenido: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE3',
  },
  citaContenidoSinBorde: {
    borderBottomWidth: 0,
  },
  citaInfo: {
    flex: 1,
  },
  citaFecha: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  citaFechaCancelada: {
    textDecorationLine: 'line-through',
    color: '#999999',
  },
  citaServicio: {
    fontSize: 13,
    color: '#888888',
    marginTop: 3,
  },
  citaCanceladaTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C0392B',
    marginTop: 3,
  },
  citaPrecioContenedor: {
    marginLeft: 12,
  },
  citaPrecio: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  citaPrezioCancelado: {
    textDecorationLine: 'line-through',
    color: '#999999',
  },

  // Estado baleiro / erro
  baleiroContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  baleiroTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
  },
  baleiroTexto: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});
