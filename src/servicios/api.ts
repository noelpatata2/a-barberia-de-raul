// =============================================================================
// NOTA PARA O BACKEND (Google Apps Script):
// Necesitase engadir o endpoint 'obtener_mis_cancelaciones' ao Apps Script.
// Debe funcionar de forma similar a 'obtener_proximas_citas', pero consultando
// a folla "Solicitudes Cancelacion" en lugar de "Citas".
// Debe filtrar as solicitudes polo nome do cliente (derivado do email
// que se obten do token de autenticacion, igual que nos demais endpoints).
// Debe devolver: { exito: true, cancelaciones: [...] } onde cada cancelacion
// ten: fecha, hora, servicio, estado ("Pendiente"/"Aprobada"/"Denegada"),
// e fechaSolicitud.
// =============================================================================

import { APPS_SCRIPT_URL } from '../constantes/configuracion';
import { RespuestaVerificacion, RespuestaCitas, RespuestaCancelaciones } from '../tipos';
import { obtenerTokenId } from './autenticacion';

// Construir URL con token como parametro (Apps Script non pode ler cabeceiras HTTP)
async function construirUrl(accion: string): Promise<string> {
  const token = await obtenerTokenId();
  const parametros = new URLSearchParams({ accion });
  if (token) {
    parametros.set('token', token);
  }
  return `${APPS_SCRIPT_URL}?${parametros.toString()}`;
}

// Verificar se o email do usuario esta vinculado a un cliente
export async function verificarCliente(): Promise<RespuestaVerificacion> {
  const url = await construirUrl('verificar_cliente');
  const respuesta = await fetch(url);
  const datos = await respuesta.json();
  return datos;
}

// Obter citas proximas do cliente
export async function obtenerProximasCitas(): Promise<RespuestaCitas> {
  const url = await construirUrl('obtener_proximas_citas');
  const respuesta = await fetch(url);
  const datos = await respuesta.json();
  return datos;
}

// Obter historial de citas do cliente
export async function obtenerHistorialCitas(): Promise<RespuestaCitas> {
  const url = await construirUrl('obtener_citas');
  const respuesta = await fetch(url);
  const datos = await respuesta.json();
  return datos;
}

// Solicitar cancelacion dunha cita
export async function solicitarCancelacion(
  fecha: string,
  hora: string,
  servicio: string
): Promise<{ exito: boolean; mensaje: string }> {
  const token = await obtenerTokenId();
  const respuesta = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accion: 'solicitar_cancelacion',
      token,
      fechaCita: fecha,
      horaCita: hora,
      servicio,
    }),
  });
  const datos = await respuesta.json();
  return datos;
}

// Solicitar reasignacion dunha cita
export async function solicitarReasignacion(
  fecha: string,
  hora: string,
  servicio: string,
  motivo: string,
  comentario: string
): Promise<{ exito: boolean; mensaje: string }> {
  const token = await obtenerTokenId();
  const respuesta = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accion: 'solicitar_reasignacion',
      token,
      fechaCita: fecha,
      horaCita: hora,
      servicio,
      motivo,
      comentario,
    }),
  });
  const datos = await respuesta.json();
  return datos;
}

// Obter solicitudes de cancelacion do cliente autenticado
export async function obtenerMisCancelaciones(): Promise<RespuestaCancelaciones> {
  const url = await construirUrl('obtener_mis_cancelaciones');
  const respuesta = await fetch(url);
  const datos = await respuesta.json();
  return datos;
}

// Obter solicitudes de reasignacion do cliente autenticado
export async function obtenerMisReasignaciones(): Promise<{ exito: boolean; reasignaciones: Array<{ fecha: string; hora: string; estado: string }> }> {
  const url = await construirUrl('obtener_mis_reasignaciones');
  const respuesta = await fetch(url);
  const datos = await respuesta.json();
  return datos;
}

// Solicitar cita extra (pendente de confirmacion pola xerencia)
export async function solicitarCitaExtra(
  servicio: string,
  fecha: string,
  hora: string,
  nota: string
): Promise<{ exito: boolean; mensaje: string }> {
  const token = await obtenerTokenId();
  const respuesta = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accion: 'solicitar_cita_extra',
      servicio,
      fecha,
      hora,
      nota,
      token,
    }),
  });
  const datos = await respuesta.json();
  return datos;
}

// Obter todas as citas dun dia especifico (para comprobar dispoñibilidade)
export async function obtenerCitasPorFecha(fecha: string): Promise<RespuestaCitas> {
  const url = await construirUrl('obtener_citas_por_fecha');
  const respuestaRaw = await fetch(url + '&fecha=' + encodeURIComponent(fecha));
  const datos = await respuestaRaw.json();
  return datos;
}

// Enviar preferencias de citas do cliente
export async function enviarPreferencias(
  datos: any
): Promise<{ exito: boolean; mensaje: string }> {
  const token = await obtenerTokenId();
  const respuesta = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accion: 'enviar_preferencias',
      ...datos,
      token,
    }),
  });
  const resultado = await respuesta.json();
  return resultado;
}

// Rexistrar token de notificacions push no backend
export async function registrarTokenNotificaciones(
  tokenPush: string
): Promise<{ exito: boolean; mensaje: string }> {
  const token = await obtenerTokenId();
  const respuesta = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accion: 'registrar_token_push',
      token_push: tokenPush,
      token,
    }),
  });
  const datos = await respuesta.json();
  return datos;
}
