import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Cita, EstadoCancelacion } from '../tipos';
import { Colores } from '../constantes/colores';

// Cores especificas do deseno
const CORES_DESENO = {
  marronProximaCita: '#8B6914',
  douradoBorde: '#8B6914',
  vermelloCancelar: '#C0392B',
  textoEscuro: '#1A1A1A',
  textoGris: '#888888',
  branco: '#FFFFFF',
};

// Configuracion das insignias segundo o estado da cancelacion
const configuracionInsignia: Record<EstadoCancelacion, { texto: string; corFondo: string; corTexto: string }> = {
  Pendiente: { texto: 'Solicitude enviada', corFondo: '#FFF3CD', corTexto: '#8B6914' },
  Aprobada: { texto: 'Cancelacion aprobada', corFondo: '#DFF0D8', corTexto: '#3D8B37' },
  Denegada: { texto: 'Cancelacion denegada', corFondo: '#F2DEDE', corTexto: '#C0392B' },
};

// Cor do borde esquerdo segundo o tipo de servizo
function obterCorBorde(servicio: string): string {
  const servicioNormalizado = servicio.toLowerCase();
  if (servicioNormalizado.includes('color')) return Colores.corteColor;
  if (servicioNormalizado.includes('barba') && servicioNormalizado.includes('corte')) return Colores.corteBarba;
  if (servicioNormalizado === 'barba') return Colores.barba;
  return Colores.corteNormal;
}

interface CitaCardProps {
  cita: Cita;
  mostrarCancelar?: boolean;
  onCancelar?: () => void;
  mostrarReasignar?: boolean;
  onReasignar?: () => void;
  estadoCancelacion?: EstadoCancelacion;
  variante?: 'normal' | 'proximaCita';
  colorBordeIzquierdo?: string;
  etiquetaSuperior?: string;
}

export default function CitaCard({
  cita,
  mostrarCancelar = false,
  onCancelar,
  mostrarReasignar = false,
  onReasignar,
  estadoCancelacion,
  variante = 'normal',
  colorBordeIzquierdo,
  etiquetaSuperior,
}: CitaCardProps) {
  // Prioridade: prop directa > variante proximaCita (marron) > cor do servizo
  const corBorde = colorBordeIzquierdo
    ? colorBordeIzquierdo
    : variante === 'proximaCita'
      ? CORES_DESENO.marronProximaCita
      : obterCorBorde(cita.servicio);

  // Formatear a lina de detalle: "Hora: 10:00h  -  Corte + Barba"
  const textoDetalle = `Hora: ${cita.hora}h  -  ${cita.servicio}`;

  return (
    <View style={estilos.tarxeta}>
      {/* Borde esquerdo de cor */}
      <View style={[estilos.bordeEsquerdo, { backgroundColor: corBorde }]} />

      <View style={estilos.contido}>
        {/* Etiqueta superior dentro da tarxeta (ex: "PROXIMA CITA") */}
        {etiquetaSuperior && (
          <Text style={estilos.etiquetaSuperior}>{etiquetaSuperior}</Text>
        )}

        {/* Data en negrita */}
        <Text style={estilos.data}>
          {cita.dia}, {cita.fecha}
        </Text>

        {/* Detalle: hora e servizo */}
        <Text style={estilos.detalle}>{textoDetalle}</Text>

        {/* Insignia de estado da cancelacion */}
        {estadoCancelacion && (
          <View style={[
            estilos.insignia,
            { backgroundColor: configuracionInsignia[estadoCancelacion].corFondo },
          ]}>
            <Text style={[
              estilos.textoInsignia,
              { color: configuracionInsignia[estadoCancelacion].corTexto },
            ]}>
              {configuracionInsignia[estadoCancelacion].texto}
            </Text>
          </View>
        )}

        {/* Botons de accion: cancelar e reasignar */}
        {(mostrarCancelar || mostrarReasignar) && estadoCancelacion !== 'Pendiente' && (
          <View style={estilos.contenedorBotonsAccion}>
            {mostrarReasignar && (
              <TouchableOpacity
                style={estilos.botonReasignar}
                onPress={onReasignar}
                activeOpacity={0.7}
              >
                <Text style={estilos.textoReasignar}>Reasignar</Text>
              </TouchableOpacity>
            )}
            {mostrarCancelar && (
              <TouchableOpacity
                style={estilos.botonCancelar}
                onPress={onCancelar}
                activeOpacity={0.7}
              >
                <Text style={estilos.textoCancelar}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarxeta: {
    backgroundColor: CORES_DESENO.branco,
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 8,
  },
  bordeEsquerdo: {
    width: 4,
  },
  contido: {
    flex: 1,
    padding: 16,
    gap: 4,
  },
  etiquetaSuperior: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B6914',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  data: {
    fontSize: 15,
    fontWeight: '700',
    color: CORES_DESENO.textoEscuro,
  },
  detalle: {
    fontSize: 14,
    color: CORES_DESENO.textoGris,
    marginTop: 2,
  },
  // Insignia tipo pastilla para estado da cancelacion
  insignia: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginTop: 8,
  },
  textoInsignia: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Botons de accion: cancelar e reasignar, posicionados abaixo a dereita
  contenedorBotonsAccion: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  botonCancelar: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: CORES_DESENO.vermelloCancelar,
    backgroundColor: 'transparent',
  },
  textoCancelar: {
    fontSize: 13,
    fontWeight: '600',
    color: CORES_DESENO.vermelloCancelar,
  },
  // Boton reasignar: pastilla dourada con borde marron
  botonReasignar: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: CORES_DESENO.douradoBorde,
    backgroundColor: 'transparent',
  },
  textoReasignar: {
    fontSize: 13,
    fontWeight: '600',
    color: CORES_DESENO.douradoBorde,
  },
});
