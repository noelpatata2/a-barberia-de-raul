import React, { useState } from 'react';
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
import { useAuth } from '../contexto/AuthContext';
import { enviarPreferencias } from '../servicios/api';

// Cores do deseno
const CORES = {
  doradoActivo: '#C8A84E',
  doradoTexto: '#8B6914',
  fondoCrema: '#F5F0E8',
  blanco: '#FFFFFF',
  textoOscuro: '#1A1A1A',
  textoGris: '#888888',
  bordeCrema: '#E8E0D0',
  marronBoton: '#6B4F0E',
};

// Opcions de servizo
const SERVIZOS = [
  'Corte normal',
  'Corte + barba',
  'Corte + color',
  'Barba',
];

// Opcions de intervalo
const INTERVALOS = [
  'Cada 2 semanas',
  'Cada 3 semanas',
  'Cada 4 semanas',
  'Cada 5 semanas',
  'Cada 6 semanas',
  'Outro',
];

// Franxas horarias
const HORAS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00',
];

// Dias da semana
const DIAS = [
  { clave: 'luns', etiqueta: 'LUNS' },
  { clave: 'martes', etiqueta: 'MARTES' },
  { clave: 'mercores', etiqueta: 'MERCORES' },
  { clave: 'xoves', etiqueta: 'XOVES' },
  { clave: 'venres', etiqueta: 'VENRES' },
  { clave: 'sabado', etiqueta: 'SABADO' },
];

// Opcions de cambio de disponibilidade
const OPCIONS_CAMBIO = [
  'A mina dispoñibilidade cambia frecuentemente',
  'Prefiro citas pola mana',
  'Prefiro citas pola tarde',
  'Son flexible',
];

// Opcions de dia alternativo
const OPCIONS_ALTERNATIVO = [
  'O dia anterior',
  'O dia seguinte',
  'Calquera dia da mesma semana',
  'Prefiro agardar a seguinte quenda',
];

// Componente de checkbox reutilizable
function CaixaSeleccion({
  seleccionado,
  etiqueta,
  onPress,
  compacto = false,
}: {
  seleccionado: boolean;
  etiqueta: string;
  onPress: () => void;
  compacto?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        estilos.caixaSeleccion,
        compacto && estilos.caixaCompacta,
        seleccionado && estilos.caixaSeleccionada,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          estilos.indicadorCaixa,
          seleccionado && estilos.indicadorActivo,
        ]}
      >
        {seleccionado && (
          <Ionicons name="checkmark" size={14} color={CORES.blanco} />
        )}
      </View>
      <Text
        style={[
          estilos.textoCaixa,
          compacto && estilos.textoCompacto,
          seleccionado && estilos.textoSeleccionado,
        ]}
      >
        {etiqueta}
      </Text>
    </TouchableOpacity>
  );
}

// Componente de boton de radio reutilizable
function BotonRadio({
  seleccionado,
  etiqueta,
  onPress,
}: {
  seleccionado: boolean;
  etiqueta: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[estilos.botonRadio, seleccionado && estilos.radioSeleccionado]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          estilos.circuloRadio,
          seleccionado && estilos.circuloRadioActivo,
        ]}
      >
        {seleccionado && <View style={estilos.puntoRadio} />}
      </View>
      <Text
        style={[
          estilos.textoRadio,
          seleccionado && estilos.textoRadioSeleccionado,
        ]}
      >
        {etiqueta}
      </Text>
    </TouchableOpacity>
  );
}

// Componente para a seccion de disponibilidade dun dia
function SeccionDia({
  dia,
  horasSeleccionadas,
  onToggleHora,
  onSeleccionarTodas,
}: {
  dia: { clave: string; etiqueta: string };
  horasSeleccionadas: Set<string>;
  onToggleHora: (hora: string) => void;
  onSeleccionarTodas: () => void;
}) {
  const todasSeleccionadas = HORAS.every((h) => horasSeleccionadas.has(h));

  return (
    <View style={estilos.seccionDia}>
      <View style={estilos.cabeceiraDia}>
        <Text style={estilos.etiquetaDia}>
          {dia.etiqueta} podo as seguintes horas:
        </Text>
        <TouchableOpacity onPress={onSeleccionarTodas} activeOpacity={0.7}>
          <Text
            style={[
              estilos.textoSeleccionarTodas,
              todasSeleccionadas && estilos.textoDeseleccionar,
            ]}
          >
            {todasSeleccionadas ? 'Deseleccionar todas' : 'Seleccionar todas'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={estilos.gradeHoras}>
        {HORAS.map((hora) => (
          <TouchableOpacity
            key={hora}
            style={[
              estilos.cellaHora,
              horasSeleccionadas.has(hora) && estilos.cellaHoraActiva,
            ]}
            onPress={() => onToggleHora(hora)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                estilos.textoHora,
                horasSeleccionadas.has(hora) && estilos.textoHoraActiva,
              ]}
            >
              {hora}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function PreferenciasCitasScreen() {
  const navigation = useNavigation<any>();
  const { cliente, usuario } = useAuth();

  // Estado do formulario
  const [nome, setNome] = useState(
    cliente?.nombre || usuario?.nombre || ''
  );
  const [telefono, setTelefono] = useState(cliente?.telefono || '');
  const [servizosSeleccionados, setServizosSeleccionados] = useState<
    Set<string>
  >(new Set());
  const [intervaloSeleccionado, setIntervaloSeleccionado] = useState('');
  const [disponibilidadeDias, setDisponibilidadeDias] = useState<
    Record<string, Set<string>>
  >({
    luns: new Set(),
    martes: new Set(),
    mercores: new Set(),
    xoves: new Set(),
    venres: new Set(),
    sabado: new Set(),
  });
  const [cambioDisponibilidade, setCambioDisponibilidade] = useState<
    Set<string>
  >(new Set());
  const [diaAlternativo, setDiaAlternativo] = useState<Set<string>>(
    new Set()
  );
  const [outrasCondicions, setOutrasCondicions] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Toggle para servizos
  function toggleServizo(servizo: string) {
    setServizosSeleccionados((prev) => {
      const novo = new Set(prev);
      if (novo.has(servizo)) {
        novo.delete(servizo);
      } else {
        novo.add(servizo);
      }
      return novo;
    });
  }

  // Toggle para horas dun dia
  function toggleHora(dia: string, hora: string) {
    setDisponibilidadeDias((prev) => {
      const novoSet = new Set(prev[dia]);
      if (novoSet.has(hora)) {
        novoSet.delete(hora);
      } else {
        novoSet.add(hora);
      }
      return { ...prev, [dia]: novoSet };
    });
  }

  // Seleccionar/deseleccionar todas as horas dun dia
  function seleccionarTodasHoras(dia: string) {
    setDisponibilidadeDias((prev) => {
      const todasSeleccionadas = HORAS.every((h) => prev[dia].has(h));
      if (todasSeleccionadas) {
        return { ...prev, [dia]: new Set() };
      } else {
        return { ...prev, [dia]: new Set(HORAS) };
      }
    });
  }

  // Toggle para cambio de disponibilidade
  function toggleCambio(opcion: string) {
    setCambioDisponibilidade((prev) => {
      const novo = new Set(prev);
      if (novo.has(opcion)) {
        novo.delete(opcion);
      } else {
        novo.add(opcion);
      }
      return novo;
    });
  }

  // Toggle para dia alternativo
  function toggleAlternativo(opcion: string) {
    setDiaAlternativo((prev) => {
      const novo = new Set(prev);
      if (novo.has(opcion)) {
        novo.delete(opcion);
      } else {
        novo.add(opcion);
      }
      return novo;
    });
  }

  // Enviar formulario
  async function enviarFormulario() {
    // Validacions basicas
    if (!nome.trim()) {
      Alert.alert('Erro', 'O nome e obrigatorio.');
      return;
    }
    if (!telefono.trim()) {
      Alert.alert('Erro', 'O numero de telefono e obrigatorio.');
      return;
    }
    if (servizosSeleccionados.size === 0) {
      Alert.alert('Erro', 'Selecciona polo menos un servizo.');
      return;
    }
    if (!intervaloSeleccionado) {
      Alert.alert('Erro', 'Selecciona un intervalo de corte.');
      return;
    }

    setEnviando(true);

    try {
      // Converter Sets a arrays para o envio
      const datos = {
        nome: nome.trim(),
        telefono: telefono.trim(),
        servizos: Array.from(servizosSeleccionados),
        intervalo: intervaloSeleccionado,
        luns: Array.from(disponibilidadeDias.luns),
        martes: Array.from(disponibilidadeDias.martes),
        mercores: Array.from(disponibilidadeDias.mercores),
        xoves: Array.from(disponibilidadeDias.xoves),
        venres: Array.from(disponibilidadeDias.venres),
        sabado: Array.from(disponibilidadeDias.sabado),
        cambioDisponibilidade: Array.from(cambioDisponibilidade),
        diaAlternativo: Array.from(diaAlternativo),
        outrasCondicions: outrasCondicions.trim(),
      };

      const resposta = await enviarPreferencias(datos);

      if (resposta.exito) {
        Alert.alert(
          'Preferencias gardadas',
          'Preferencias gardadas correctamente',
          [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Erro',
          resposta.mensaje || 'Non se puideron gardar as preferencias.'
        );
      }
    } catch {
      Alert.alert(
        'Erro',
        'Erro de conexion. Comproba o teu internet e intentao de novo.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={estilos.contenedor}>
      {/* Cabeceira */}
      <View style={estilos.cabeceira}>
        <TouchableOpacity
          style={estilos.botonVolver}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={CORES.doradoTexto} />
        </TouchableOpacity>
        <View style={estilos.textosCabeceira}>
          <Text style={estilos.tituloCabeceira}>Preferencias de Citas</Text>
          <Text style={estilos.subtituloCabeceira}>
            Configura as tuas preferencias
          </Text>
        </View>
      </View>

      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.scrollContido}
        showsVerticalScrollIndicator={false}
      >
        {/* Seccion 1: Datos */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Datos</Text>
          <TextInput
            style={estilos.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Nome completo"
            placeholderTextColor={CORES.textoGris}
          />
        </View>

        {/* Seccion 2: Telefono */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Numero de telefono</Text>
          <TextInput
            style={estilos.input}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Ex: 600 123 456"
            placeholderTextColor={CORES.textoGris}
            keyboardType="phone-pad"
          />
        </View>

        {/* Seccion 3: Servizos */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Que servizo fas?</Text>
          {SERVIZOS.map((servizo) => (
            <CaixaSeleccion
              key={servizo}
              seleccionado={servizosSeleccionados.has(servizo)}
              etiqueta={servizo}
              onPress={() => toggleServizo(servizo)}
            />
          ))}
        </View>

        {/* Seccion 4: Intervalo de corte */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>
            Cal e o teu intervalo de corte?
          </Text>
          {INTERVALOS.map((intervalo) => (
            <BotonRadio
              key={intervalo}
              seleccionado={intervaloSeleccionado === intervalo}
              etiqueta={intervalo}
              onPress={() => setIntervaloSeleccionado(intervalo)}
            />
          ))}
        </View>

        {/* Seccion 5: Disponibilidade por dia */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Disponibilidade por dia</Text>
          {DIAS.map((dia) => (
            <SeccionDia
              key={dia.clave}
              dia={dia}
              horasSeleccionadas={disponibilidadeDias[dia.clave]}
              onToggleHora={(hora) => toggleHora(dia.clave, hora)}
              onSeleccionarTodas={() => seleccionarTodasHoras(dia.clave)}
            />
          ))}
        </View>

        {/* Seccion 6: Cambio de disponibilidade */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>
            Cambio de dispoñibilidade:
          </Text>
          {OPCIONS_CAMBIO.map((opcion) => (
            <CaixaSeleccion
              key={opcion}
              seleccionado={cambioDisponibilidade.has(opcion)}
              etiqueta={opcion}
              onPress={() => toggleCambio(opcion)}
            />
          ))}
        </View>

        {/* Seccion 7: Dia alternativo */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>
            Se o dia que quero e festivo ou non hai sitio, pode ser:
          </Text>
          {OPCIONS_ALTERNATIVO.map((opcion) => (
            <CaixaSeleccion
              key={opcion}
              seleccionado={diaAlternativo.has(opcion)}
              etiqueta={opcion}
              onPress={() => toggleAlternativo(opcion)}
            />
          ))}
        </View>

        {/* Seccion 8: Outras condicions */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Outras condicions:</Text>
          <TextInput
            style={[estilos.input, estilos.inputMultilina]}
            value={outrasCondicions}
            onChangeText={setOutrasCondicions}
            placeholder="Escribe aqui calquera outra condicion ou preferencia..."
            placeholderTextColor={CORES.textoGris}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Seccion 9: Plano de turnos (proximamente) */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>
            Engadir plano de turnos (opcional)
          </Text>
          <View style={estilos.proximamente}>
            <Ionicons name="time-outline" size={20} color={CORES.textoGris} />
            <Text style={estilos.textoProximamente}>Proximamente</Text>
          </View>
        </View>

        {/* Boton de enviar */}
        <TouchableOpacity
          style={[estilos.botonEnviar, enviando && estilos.botonDesactivado]}
          onPress={enviarFormulario}
          activeOpacity={0.7}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator size="small" color={CORES.blanco} />
          ) : (
            <Text style={estilos.textoBotonEnviar}>Enviar preferencias</Text>
          )}
        </TouchableOpacity>

        {/* Espaciado inferior */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: CORES.fondoCrema,
  },

  // Cabeceira
  cabeceira: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: CORES.blanco,
    borderBottomWidth: 1,
    borderBottomColor: CORES.bordeCrema,
  },
  botonVolver: {
    padding: 4,
    marginRight: 8,
  },
  textosCabeceira: {
    flex: 1,
  },
  tituloCabeceira: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.textoOscuro,
  },
  subtituloCabeceira: {
    fontSize: 13,
    color: CORES.textoGris,
    marginTop: 2,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContido: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Seccions
  seccion: {
    marginBottom: 24,
  },
  tituloSeccion: {
    fontSize: 15,
    fontWeight: '700',
    color: CORES.textoOscuro,
    marginBottom: 12,
  },

  // Inputs de texto
  input: {
    backgroundColor: CORES.blanco,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CORES.bordeCrema,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: CORES.textoOscuro,
  },
  inputMultilina: {
    minHeight: 100,
    paddingTop: 12,
  },

  // Caixas de seleccion (checkboxes)
  caixaSeleccion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CORES.blanco,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CORES.bordeCrema,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  caixaCompacta: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  caixaSeleccionada: {
    borderColor: CORES.doradoActivo,
    backgroundColor: '#FDF8EC',
  },
  indicadorCaixa: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: CORES.bordeCrema,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  indicadorActivo: {
    backgroundColor: CORES.doradoActivo,
    borderColor: CORES.doradoActivo,
  },
  textoCaixa: {
    fontSize: 14,
    color: CORES.textoOscuro,
    flex: 1,
  },
  textoCompacto: {
    fontSize: 13,
  },
  textoSeleccionado: {
    fontWeight: '600',
    color: CORES.doradoTexto,
  },

  // Botons de radio
  botonRadio: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CORES.blanco,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CORES.bordeCrema,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  radioSeleccionado: {
    borderColor: CORES.doradoActivo,
    backgroundColor: '#FDF8EC',
  },
  circuloRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: CORES.bordeCrema,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  circuloRadioActivo: {
    borderColor: CORES.doradoActivo,
  },
  puntoRadio: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: CORES.doradoActivo,
  },
  textoRadio: {
    fontSize: 14,
    color: CORES.textoOscuro,
    flex: 1,
  },
  textoRadioSeleccionado: {
    fontWeight: '600',
    color: CORES.doradoTexto,
  },

  // Disponibilidade por dia
  seccionDia: {
    marginBottom: 16,
    backgroundColor: CORES.blanco,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CORES.bordeCrema,
    padding: 12,
  },
  cabeceiraDia: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  etiquetaDia: {
    fontSize: 13,
    fontWeight: '700',
    color: CORES.textoOscuro,
    flex: 1,
  },
  textoSeleccionarTodas: {
    fontSize: 12,
    color: CORES.doradoTexto,
    fontWeight: '600',
  },
  textoDeseleccionar: {
    color: CORES.textoGris,
  },
  gradeHoras: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cellaHora: {
    width: '18%',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CORES.bordeCrema,
    alignItems: 'center',
    backgroundColor: CORES.fondoCrema,
  },
  cellaHoraActiva: {
    backgroundColor: CORES.doradoActivo,
    borderColor: CORES.doradoActivo,
  },
  textoHora: {
    fontSize: 12,
    color: CORES.textoOscuro,
    fontWeight: '500',
  },
  textoHoraActiva: {
    color: CORES.blanco,
    fontWeight: '700',
  },

  // Proximamente
  proximamente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CORES.blanco,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CORES.bordeCrema,
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 8,
  },
  textoProximamente: {
    fontSize: 14,
    color: CORES.textoGris,
    fontStyle: 'italic',
  },

  // Boton de enviar
  botonEnviar: {
    backgroundColor: CORES.marronBoton,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  botonDesactivado: {
    opacity: 0.6,
  },
  textoBotonEnviar: {
    fontSize: 16,
    fontWeight: '700',
    color: CORES.blanco,
  },
});
