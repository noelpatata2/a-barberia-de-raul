// Tipos principais da aplicacion

export interface Cliente {
  nombre: string;
  totalCitas: number;
  email: string;
  telefono?: string;
}

export interface Cita {
  fecha: string;       // formato DD/MM/YYYY
  dia: string;         // Luns, Martes, etc.
  hora: string;        // formato HH:MM
  cliente: string;
  servicio: TipoServicio;
  importe?: string;
  estado?: string;     // estado da cita (cancelada, etc.)
}

export type TipoServicio = 'Corte normal' | 'Corte + barba' | 'Corte + color' | 'Barba' | string;

export interface RespuestaVerificacion {
  verificado: boolean;
  cliente?: Cliente;
  mensaje?: string;
}

export interface RespuestaCitas {
  exito: boolean;
  citas: Cita[];
  mensaje?: string;
}

export interface UsuarioAutenticado {
  uid: string;
  email: string | null;
  nombre: string | null;
  fotoUrl: string | null;
}

export type EstadoCliente = 'cargando' | 'verificado' | 'pendiente' | 'error';

// Estados posibles dunha solicitude de cancelacion
export type EstadoCancelacion = 'Pendiente' | 'Aprobada' | 'Denegada';

// Solicitude de cancelacion de cita
export interface SolicitudCancelacion {
  fecha: string;        // fecha da cita solicitada para cancelar (DD/MM/YYYY)
  hora: string;         // hora da cita (HH:MM)
  servicio: string;
  estado: EstadoCancelacion;
  fechaSolicitud: string; // cando se enviou a solicitude
}

// Resposta do endpoint obtener_mis_cancelaciones
export interface RespuestaCancelaciones {
  exito: boolean;
  cancelaciones: SolicitudCancelacion[];
  mensaje?: string;
}
