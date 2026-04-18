import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colores } from '../constantes/colores';

// Obter hora actual formateada
function obterHoraActual(): string {
  const agora = new Date();
  const horas = ('0' + agora.getHours()).slice(-2);
  const minutos = ('0' + agora.getMinutes()).slice(-2);
  return `${horas}:${minutos}`;
}

export default function SolicitudCitaEnviadaScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { servizo, fechaTexto, hora } = route.params || {};
  const horaEnvio = obterHoraActual();

  function volverAoInicio() {
    navigation.popToTop();
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
        <Text style={estilos.cabeceiraTitulo}>Solicitude Enviada</Text>
      </View>

      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.scrollContido}
        showsVerticalScrollIndicator={false}
      >
        {/* Icona principal */}
        <View style={estilos.iconaContenedor}>
          <View style={estilos.iconaCirculo}>
            <Ionicons name="time-outline" size={48} color="#C8A84E" />
          </View>
        </View>

        <Text style={estilos.tituloPrincipal}>Solicitude de cita enviada</Text>

        {/* Detalle da solicitude */}
        <Text style={estilos.seccionTitulo}>Detalle da tua solicitude</Text>
        <View style={estilos.tarxetaDetalle}>
          <View style={estilos.tarxetaBordeLateral} />
          <View style={estilos.tarxetaContido}>
            <Text style={estilos.detalleEtiqueta}>Servizo solicitado</Text>
            <Text style={estilos.detalleValor}>{servizo || 'Corte de pelo'}</Text>

            <Text style={[estilos.detalleEtiqueta, { marginTop: 14 }]}>
              Data preferida
            </Text>
            <Text style={estilos.detalleValor}>
              {fechaTexto || 'Xoves, 17 Abril 2025'} | {hora || '09:00'}h
            </Text>

            <Text style={estilos.detalleEnviado}>
              Enviado: hoxe as {horaEnvio}h
            </Text>

            <View style={estilos.pillPendente}>
              <Text style={estilos.pillPendenteTexto}>
                Pendente de confirmacion
              </Text>
            </View>
          </View>
        </View>

        {/* Que ocorre agora? */}
        <Text style={estilos.seccionTitulo}>Que ocorre agora?</Text>
        <View style={estilos.tarxetaPasos}>
          {/* Paso 1 - Verde (completado) */}
          <View style={estilos.pasoFila}>
            <View style={[estilos.pasoCirculo, estilos.pasoCirculoVerde]}>
              <Ionicons name="checkmark" size={14} color={Colores.textoBlanco} />
            </View>
            <View style={estilos.pasoLinea}>
              <View style={[estilos.pasoLineaVertical, estilos.pasoLineaVerde]} />
            </View>
            <Text style={[estilos.pasoTexto, estilos.pasoTextoVerde]}>
              Solicitude recibida pola xerencia
            </Text>
          </View>

          {/* Paso 2 - Gris (pendente) */}
          <View style={estilos.pasoFila}>
            <View style={[estilos.pasoCirculo, estilos.pasoCirculoGris]}>
              <Text style={estilos.pasoNumero}>2</Text>
            </View>
            <View style={estilos.pasoLinea}>
              <View style={[estilos.pasoLineaVertical, estilos.pasoLineaGris]} />
            </View>
            <Text style={[estilos.pasoTexto, estilos.pasoTextoGris]}>
              A xerencia revisa disponibilidade
            </Text>
          </View>

          {/* Paso 3 - Gris (pendente) */}
          <View style={estilos.pasoFila}>
            <View style={[estilos.pasoCirculo, estilos.pasoCirculoGris]}>
              <Text style={estilos.pasoNumero}>3</Text>
            </View>
            <View style={estilos.pasoLinea} />
            <Text style={[estilos.pasoTexto, estilos.pasoTextoGris]}>
              Recibes confirmacion ou nova proposta
            </Text>
          </View>
        </View>

        {/* Caixa informativa */}
        <View style={estilos.caixaInfo}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#8B6914"
            style={{ marginRight: 8, marginTop: 1 }}
          />
          <Text style={estilos.caixaInfoTexto}>
            A xerencia pode confirmar ou proponher unha hora ou dia alternativo.
            Recibiras unha notificacion na app.
          </Text>
        </View>

        {/* Boton volver */}
        <TouchableOpacity
          style={estilos.botonVolverInicio}
          onPress={volverAoInicio}
          activeOpacity={0.8}
        >
          <Text style={estilos.botonVolverTexto}>Volver ao inicio</Text>
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
  cabeceiraTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: Colores.textoOscuro,
  },
  scroll: {
    flex: 1,
  },
  scrollContido: {
    paddingHorizontal: 16,
    paddingTop: 28,
  },

  // Icona principal
  iconaContenedor: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconaCirculo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#C8A84E',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDF5',
  },

  tituloPrincipal: {
    fontSize: 20,
    fontWeight: '700',
    color: Colores.textoOscuro,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtituloPrincipal: {
    marginBottom: 24,
  },

  // Seccion titulo
  seccionTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: Colores.textoOscuro,
    marginBottom: 10,
    marginTop: 4,
  },

  // Tarxeta detalle
  tarxetaDetalle: {
    flexDirection: 'row',
    backgroundColor: Colores.fondoTarjeta,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colores.borde,
  },
  tarxetaBordeLateral: {
    width: 4,
    backgroundColor: '#6B4F0E',
  },
  tarxetaContido: {
    flex: 1,
    padding: 16,
  },
  detalleEtiqueta: {
    fontSize: 12,
    color: Colores.textoClaro,
    marginBottom: 3,
  },
  detalleValor: {
    fontSize: 15,
    fontWeight: '700',
    color: Colores.textoOscuro,
  },
  detalleEnviado: {
    fontSize: 12,
    color: Colores.textoClaro,
    marginTop: 14,
    marginBottom: 10,
  },
  pillPendente: {
    alignSelf: 'flex-start',
    backgroundColor: '#DFF0D8',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pillPendenteTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3D8B37',
  },

  // Pasos
  tarxetaPasos: {
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  pasoFila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  pasoCirculo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pasoCirculoVerde: {
    backgroundColor: '#3D8B37',
  },
  pasoCirculoGris: {
    backgroundColor: '#D0D0D0',
  },
  pasoNumero: {
    fontSize: 12,
    fontWeight: '700',
    color: Colores.textoBlanco,
  },
  pasoLinea: {
    width: 26,
    position: 'absolute',
    left: 0,
    top: 26,
    height: 14,
    alignItems: 'center',
  },
  pasoLineaVertical: {
    width: 2,
    height: 14,
  },
  pasoLineaVerde: {
    backgroundColor: '#3D8B37',
  },
  pasoLineaGris: {
    backgroundColor: '#D0D0D0',
  },
  pasoTexto: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
    marginTop: 3,
  },
  pasoTextoVerde: {
    color: '#3D8B37',
    fontWeight: '600',
  },
  pasoTextoGris: {
    color: Colores.textoMedio,
  },

  // Caixa informativa
  caixaInfo: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E7',
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
  },
  caixaInfoTexto: {
    flex: 1,
    fontSize: 13,
    color: '#8B6914',
    lineHeight: 18,
  },

  // Boton volver
  botonVolverInicio: {
    backgroundColor: '#6B4F0E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonVolverTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: Colores.textoBlanco,
  },
});
