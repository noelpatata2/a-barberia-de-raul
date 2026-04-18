import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Colores } from '../constantes/colores';
import { obtenerHistorialCitas } from '../servicios/api';
import { Cita } from '../tipos';

// Meses abreviados en galego
const MESES_ABREVIADOS = [
  'Xan', 'Feb', 'Mar', 'Abr', 'Mai', 'Xun',
  'Xul', 'Ago', 'Set', 'Out', 'Nov', 'Dec',
];

// Estados posibles dunha cita anual
type EstadoCitaAnual = 'Realizada' | 'Proxima' | 'Pendente';

// Cita con estado calculado para a vista anual
interface CitaAnualItem {
  cita: Cita;
  estado: EstadoCitaAnual;
  dataObj: Date;
}

// Cores por estado
const CORES_ESTADO = {
  Realizada: {
    borde: Colores.exito,           // #3D8B37
    texto: Colores.exito,
    fondoPastilla: '#E8F5E7',
    textoData: Colores.exito,
  },
  Proxima: {
    borde: Colores.primarioClaro,   // #C8A84E
    texto: Colores.primarioClaro,
    fondoPastilla: '#FFF8E7',
    textoData: Colores.primarioClaro,
  },
  Pendente: {
    borde: Colores.borde,           // #E8E0D0
    texto: '#999999',
    fondoPastilla: '#F5F0E8',
    textoData: '#999999',
  },
};

// Parsear data DD/MM/YYYY a obxecto Date
function parsearData(dataStr: string): Date {
  const partes = dataStr.split('/');
  if (partes.length !== 3) return new Date();
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const anio = parseInt(partes[2], 10);
  return new Date(anio, mes, dia);
}

// Formatear data a "Xan 14"
function formatearDataCurta(data: Date): string {
  const mes = MESES_ABREVIADOS[data.getMonth()];
  const dia = data.getDate();
  return `${mes} ${dia}`;
}

// Clasificar citas en Realizada, Proxima ou Pendente
function clasificarCitas(citas: Cita[]): CitaAnualItem[] {
  const agora = new Date();
  // Por a hora a medianoite para comparar so datas
  agora.setHours(0, 0, 0, 0);

  const citasConData = citas.map((cita) => ({
    cita,
    dataObj: parsearData(cita.fecha),
    estado: 'Pendente' as EstadoCitaAnual,
  }));

  // Ordenar por data ascendente
  citasConData.sort((a, b) => a.dataObj.getTime() - b.dataObj.getTime());

  let proximaAtopada = false;

  for (const item of citasConData) {
    if (item.dataObj < agora) {
      item.estado = 'Realizada';
    } else if (!proximaAtopada) {
      item.estado = 'Proxima';
      proximaAtopada = true;
    } else {
      item.estado = 'Pendente';
    }
  }

  return citasConData;
}

// Componente para cada elemento da lista de citas
function ElementoCita({ item }: { item: CitaAnualItem }) {
  const cores = CORES_ESTADO[item.estado];
  const dataFormateada = formatearDataCurta(item.dataObj);
  const horaFormateada = item.cita.hora ? `${item.cita.hora}h` : '';
  const descripcion = horaFormateada
    ? `${item.cita.servicio} | ${horaFormateada}`
    : item.cita.servicio;

  return (
    <View style={estilos.elementoCita}>
      {/* Borde lateral esquerdo de cor */}
      <View style={[estilos.bordeLateral, { backgroundColor: cores.borde }]} />

      {/* Contido central */}
      <View style={estilos.contidoCita}>
        <Text style={[estilos.dataCita, { color: cores.textoData }]}>
          {dataFormateada}
        </Text>
        <Text style={estilos.descripcionCita} numberOfLines={1}>
          {descripcion}
        </Text>
      </View>

      {/* Pastilla de estado */}
      <View style={[estilos.pastillaEstado, { backgroundColor: cores.fondoPastilla }]}>
        <Text style={[estilos.textoPastilla, { color: cores.texto }]}>
          {item.estado}
        </Text>
      </View>
    </View>
  );
}

export default function CitasAnualesScreen() {
  const [citas, setCitas] = useState<CitaAnualItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const cargarCitas = useCallback(async (esRefresco = false) => {
    try {
      if (!esRefresco) setCargando(true);
      setErro(null);

      const resposta = await obtenerHistorialCitas();

      if (resposta.exito && resposta.citas) {
        const clasificadas = clasificarCitas(resposta.citas);
        setCitas(clasificadas);
      } else {
        setErro(resposta.mensaje || 'Non se puideron cargar as citas');
      }
    } catch (err) {
      setErro('Erro de conexion. Intentao de novo.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargarCitas();
  }, [cargarCitas]);

  const aoRefrescar = useCallback(() => {
    setRefrescando(true);
    cargarCitas(true);
  }, [cargarCitas]);

  // Calcular estatisticas
  const totalCitas = citas.length;
  const completadas = citas.filter((c) => c.estado === 'Realizada').length;
  const porcentaxe = totalCitas > 0 ? Math.round((completadas / totalCitas) * 100) : 0;

  // Determinar o ano baseado nos datos
  const anio = citas.length > 0
    ? citas[0].dataObj.getFullYear()
    : new Date().getFullYear();

  // Pantalla de carga inicial
  if (cargando) {
    return (
      <View style={estilos.contenedorCarga}>
        <ActivityIndicator size="large" color={Colores.primarioClaro} />
        <Text style={estilos.textoCarga}>Cargando citas...</Text>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      {/* Cabeceira */}
      <View style={estilos.cabeceira}>
        <Text style={estilos.tituloCabeceira}>Citas Anuais {anio}</Text>
        <Text style={estilos.subtituloCabeceira}>
          {completadas} de {totalCitas} citas completadas
        </Text>
      </View>

      {/* Barra de progreso */}
      <View style={estilos.contenedorProgreso}>
        <View style={estilos.etiquetasProgreso}>
          <Text style={estilos.textoProgreso}>Progreso do ano</Text>
          <Text style={estilos.textoPorcentaxe}>{porcentaxe}%</Text>
        </View>
        <View style={estilos.fondoBarra}>
          <View
            style={[
              estilos.rellenoBarra,
              { width: `${porcentaxe}%` },
            ]}
          />
        </View>
      </View>

      {/* Titulo de seccion */}
      <Text style={estilos.tituloSeccion}>Todas as tuas citas</Text>

      {/* Lista de citas ou mensaxe de erro/baleiro */}
      {erro ? (
        <View style={estilos.contenedorMensaxe}>
          <Text style={estilos.textoErro}>{erro}</Text>
        </View>
      ) : citas.length === 0 ? (
        <View style={estilos.contenedorMensaxe}>
          <Text style={estilos.textoBaleiro}>Non tes citas rexistradas</Text>
        </View>
      ) : (
        <FlatList
          data={citas}
          keyExtractor={(item, index) => `${item.cita.fecha}-${item.cita.hora}-${index}`}
          renderItem={({ item }) => <ElementoCita item={item} />}
          contentContainerStyle={estilos.listaContido}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={aoRefrescar}
              tintColor={Colores.primarioClaro}
              colors={[Colores.primarioClaro]}
            />
          }
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  contenedorCarga: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCarga: {
    marginTop: 12,
    fontSize: 16,
    color: '#999999',
  },

  // Cabeceira
  cabeceira: {
    backgroundColor: '#FFFFFF',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E0D0',
  },
  tituloCabeceira: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtituloCabeceira: {
    fontSize: 14,
    color: '#888888',
  },

  // Barra de progreso
  contenedorProgreso: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  etiquetasProgreso: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  textoProgreso: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  textoPorcentaxe: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D8B37',
  },
  fondoBarra: {
    height: 10,
    backgroundColor: '#F5F0E8',
    borderRadius: 5,
    overflow: 'hidden',
  },
  rellenoBarra: {
    height: '100%',
    backgroundColor: '#3D8B37',
    borderRadius: 5,
  },

  // Titulo de seccion
  tituloSeccion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 16,
  },

  // Lista
  listaContido: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // Elemento de cita
  elementoCita: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  bordeLateral: {
    width: 4,
    alignSelf: 'stretch',
  },
  contidoCita: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  dataCita: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  descripcionCita: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  pastillaEstado: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 14,
  },
  textoPastilla: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Mensaxes
  contenedorMensaxe: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  textoErro: {
    fontSize: 16,
    color: Colores.error,
    textAlign: 'center',
  },
  textoBaleiro: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
});
