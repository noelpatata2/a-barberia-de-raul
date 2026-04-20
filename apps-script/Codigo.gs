// ============================================================
// Backend de la aplicacion "Peluqueria de Raul"
// Desplegado como Web App de Google Apps Script
// Hoja de calculo: "Peluqueria - Citas"
// ============================================================

// Nombre de la hoja de calculo
var NOMBRE_HOJA = "Peluqueria - Citas";

// Nombres de las pestanas
var PESTANA_CITAS = "Citas Peluqueria";
var PESTANA_CLIENTES = "Clientes";
var PESTANA_CANCELACIONES = "Solicitudes Cancelacion";
var PESTANA_CITAS_EXTRA = "Solicitudes Cita Extra";
var PESTANA_REASIGNACIONES = "Solicitudes Reasignacion";
var PESTANA_PREFERENCIAS = "Preferencias Clientes";

// ============================================================
// MANEJO DE PETICIONES GET
// ============================================================
function doGet(e) {
  var accion = e.parameter.accion;

  try {
    switch (accion) {
      case "verificar_cliente":
        return crearRespuesta(verificarCliente(e));

      case "obtener_proximas_citas":
        return crearRespuesta(obtenerProximasCitas(e));

      case "obtener_citas":
        return crearRespuesta(obtenerTodasLasCitas(e));

      case "oauth_redirect":
        return manejarRedirectOAuth();

      case "obtener_cancelaciones":
        if (!verificarAdmin(e, null)) return crearRespuesta({ error: true, mensaje: "Acceso non autorizado" });
        return crearRespuesta(obtenerCancelaciones());

      case "obtener_clientes":
        if (!verificarAdmin(e, null)) return crearRespuesta({ error: true, mensaje: "Acceso non autorizado" });
        return crearRespuesta(obtenerClientes());

      case "obtener_todas_citas_admin":
        if (!verificarAdmin(e, null)) return crearRespuesta({ error: true, mensaje: "Acceso non autorizado" });
        return crearRespuesta(obtenerTodasCitasAdmin());

      case "obtener_mis_cancelaciones":
        return crearRespuesta(obtenerMisCancelaciones(e));

      case "obtener_mis_reasignaciones":
        return crearRespuesta(obtenerMisReasignaciones(e));

      case "obtener_citas_por_fecha":
        return crearRespuesta(obtenerCitasPorFecha(e));

      case "obtener_citas_extra":
        if (!verificarAdmin(e, null)) return crearRespuesta({ error: true, mensaje: "Acceso non autorizado" });
        return crearRespuesta(obtenerCitasExtra());

      case "obtener_reasignaciones":
        if (!verificarAdmin(e, null)) return crearRespuesta({ error: true, mensaje: "Acceso non autorizado" });
        return crearRespuesta(obtenerReasignaciones());

      case "obtener_preferencias_cliente":
        if (!verificarAdmin(e, null)) return crearRespuesta({ error: true, mensaje: "Acceso non autorizado" });
        return crearRespuesta(obtenerPreferenciasCliente(e));

      case "obtener_slots_fecha":
        if (!verificarAdmin(e, null)) return crearRespuesta({ error: true, mensaje: "Acceso non autorizado" });
        return crearRespuesta(obtenerSlotsFecha(e));

      default:
        return crearRespuesta({ error: true, mensaje: "Accion no reconocida" });
    }
  } catch (error) {
    Logger.log("Erro en doGet: " + error.message);
    return crearRespuesta({ error: true, mensaje: "Erro interno do servidor" });
  }
}

// ============================================================
// MANEJO DE PETICIONES POST
// ============================================================
function doPost(e) {
  try {
    var cuerpo = JSON.parse(e.postData.contents);
    var accion = cuerpo.accion;

    switch (accion) {
      case "solicitar_cancelacion":
        return crearRespuesta(solicitarCancelacion(e, cuerpo));

      case "actualizar_cancelacion":
        if (!verificarAdmin(e, cuerpo)) return crearRespuesta({ error: true, mensaje: "Acceso non autorizado" });
        return crearRespuesta(actualizarCancelacion(cuerpo));

      case "actualizar_email_cliente":
        if (!verificarAdmin(e, cuerpo)) return crearRespuesta({ error: true, mensaje: "Acceso non autorizado" });
        return crearRespuesta(actualizarEmailCliente(cuerpo));

      case "actualizar_telefono_cliente":
        if (!verificarAdmin(e, cuerpo)) return crearRespuesta({ error: true, mensaje: "Acceso non autorizado" });
        return crearRespuesta(actualizarTelefonoCliente(cuerpo));

      case "crear_cliente":
        if (!verificarAdmin(e, cuerpo)) return crearRespuesta({ error: true, mensaje: "Acceso non autorizado" });
        return crearRespuesta(crearCliente(cuerpo));

      case "asignar_cita_admin":
        if (!verificarAdmin(e, cuerpo)) return crearRespuesta({ error: true, mensaje: "Acceso non autorizado" });
        return crearRespuesta(asignarCitaAdmin(cuerpo));

      case "actualizar_preferencias_admin":
        if (!verificarAdmin(e, cuerpo)) return crearRespuesta({ error: true, mensaje: "Acceso non autorizado" });
        return crearRespuesta(actualizarPreferenciasAdmin(cuerpo));

      case "registrar_token_push":
        return crearRespuesta(registrarTokenPush(e, cuerpo));

      case "solicitar_cita_extra":
        return crearRespuesta(solicitarCitaExtra(e, cuerpo));

      case "actualizar_cita_extra":
        if (!verificarAdmin(e, cuerpo)) return crearRespuesta({ error: true, mensaje: "Acceso non autorizado" });
        return crearRespuesta(actualizarCitaExtra(cuerpo));

      case "enviar_preferencias":
        return crearRespuesta(enviarPreferencias(e, cuerpo));

      case "solicitar_reasignacion":
        return crearRespuesta(solicitarReasignacion(e, cuerpo));

      case "actualizar_reasignacion":
        if (!verificarAdmin(e, cuerpo)) return crearRespuesta({ error: true, mensaje: "Acceso non autorizado" });
        return crearRespuesta(actualizarReasignacion(cuerpo));

      default:
        return crearRespuesta({ error: true, mensaje: "Accion no reconocida" });
    }
  } catch (error) {
    Logger.log("Erro en doPost: " + error.message);
    return crearRespuesta({ error: true, mensaje: "Erro interno do servidor" });
  }
}

// ============================================================
// VERIFICACION DE CLIENTE
// Busca el email del token en la hoja "Clientes" (columna C)
// ============================================================
function verificarCliente(e) {
  var email = obtenerEmailDelToken(e);

  if (!email) {
    return { verificado: false, mensaje: "Token no valido o email no encontrado" };
  }

  var hoja = obtenerHoja(PESTANA_CLIENTES);
  var datos = hoja.getDataRange().getValues();

  for (var i = 1; i < datos.length; i++) {
    var emailHoja = datos[i][2] ? datos[i][2].toString().trim().toLowerCase() : "";

    if (emailHoja === email.toLowerCase()) {
      var cliente = {
        nombre: datos[i][0],
        totalCitas: datos[i][1],
        email: datos[i][2],
        telefono: datos[i][3]
      };

      return { verificado: true, cliente: cliente };
    }
  }

  return { verificado: false, mensaje: "Email no vinculado" };
}

// ============================================================
// OBTENER PROXIMAS CITAS
// Devuelve las citas del cliente con fecha >= hoy
// ============================================================
function obtenerProximasCitas(e) {
  var email = obtenerEmailDelToken(e);

  if (!email) {
    return { exito: false, mensaje: "Token no valido" };
  }

  var nombreCliente = obtenerNombreClientePorEmail(email);

  if (!nombreCliente) {
    return { exito: false, mensaje: "Cliente no encontrado" };
  }

  var hoja = obtenerHoja(PESTANA_CITAS);
  var datos = hoja.getDataRange().getValues();
  var hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  var citasFiltradas = [];

  for (var i = 1; i < datos.length; i++) {
    var clienteFila = datos[i][3] ? datos[i][3].toString().trim() : "";

    if (clienteFila.toLowerCase() === nombreCliente.toLowerCase()) {
      var fechaCita = parsearFecha(datos[i][0]);

      if (fechaCita && fechaCita >= hoy) {
        citasFiltradas.push({
          fecha: formatearValorFecha(datos[i][0]),
          dia: datos[i][1],
          hora: formatearValorHora(datos[i][2]),
          cliente: datos[i][3],
          servicio: datos[i][4],
          importe: datos[i][5]
        });
      }
    }
  }

  citasFiltradas.sort(function (a, b) {
    return parsearFecha(a.fecha) - parsearFecha(b.fecha);
  });

  return { exito: true, citas: citasFiltradas };
}

// ============================================================
// OBTENER TODAS LAS CITAS
// Devuelve todas las citas del cliente, ordenadas por fecha descendente
// ============================================================
function obtenerTodasLasCitas(e) {
  var email = obtenerEmailDelToken(e);

  if (!email) {
    return { exito: false, mensaje: "Token no valido" };
  }

  var nombreCliente = obtenerNombreClientePorEmail(email);

  if (!nombreCliente) {
    return { exito: false, mensaje: "Cliente no encontrado" };
  }

  var hoja = obtenerHoja(PESTANA_CITAS);
  var datos = hoja.getDataRange().getValues();

  var todasLasCitas = [];

  for (var i = 1; i < datos.length; i++) {
    var clienteFila = datos[i][3] ? datos[i][3].toString().trim() : "";

    if (clienteFila.toLowerCase() === nombreCliente.toLowerCase()) {
      todasLasCitas.push({
        fecha: formatearValorFecha(datos[i][0]),
        dia: datos[i][1],
        hora: formatearValorHora(datos[i][2]),
        cliente: datos[i][3],
        servicio: datos[i][4],
        importe: datos[i][5]
      });
    }
  }

  todasLasCitas.sort(function (a, b) {
    return parsearFecha(b.fecha) - parsearFecha(a.fecha);
  });

  return { exito: true, citas: todasLasCitas };
}

// ============================================================
// SOLICITAR CANCELACION DE CITA
// ============================================================
function solicitarCancelacion(e, cuerpo) {
  if (cuerpo.token) {
    e.parameter = e.parameter || {};
    e.parameter.token = cuerpo.token;
  }
  var email = obtenerEmailDelToken(e);

  if (!email) {
    return { exito: false, mensaje: "Token no valido" };
  }

  var nombreCliente = obtenerNombreClientePorEmail(email);

  if (!nombreCliente) {
    return { exito: false, mensaje: "Cliente no encontrado" };
  }

  var hoja = obtenerOCrearHojaCancelaciones();

  var ahora = new Date();
  var fechaSolicitud = Utilities.formatDate(ahora, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");

  hoja.appendRow([
    sanitizarParaCelda(nombreCliente),
    sanitizarParaCelda(cuerpo.fechaCita),
    sanitizarParaCelda(cuerpo.horaCita),
    sanitizarParaCelda(cuerpo.servicio),
    sanitizarParaCelda(fechaSolicitud),
    "Pendiente"
  ]);

  enviarTelegramAdmin("🔔 <b>Nova CANCELACIÓN</b>\n" +
    "Cliente: " + nombreCliente + "\n" +
    "Data: " + (cuerpo.fechaCita || "-") + " " + (cuerpo.horaCita || "") + "\n" +
    "Servizo: " + (cuerpo.servicio || "-"));

  return { exito: true, mensaje: "Solicitud de cancelacion enviada" };
}

// ============================================================
// OBTENER MIS CANCELACIONES (CLIENTE)
// Devuelve las cancelaciones del cliente autenticado
// ============================================================
function obtenerMisCancelaciones(e) {
  var email = obtenerEmailDelToken(e);

  if (!email) {
    return { exito: false, mensaje: "Token no valido" };
  }

  var nombreCliente = obtenerNombreClientePorEmail(email);

  if (!nombreCliente) {
    return { exito: false, mensaje: "Cliente no encontrado" };
  }

  var hoja = obtenerHoja(PESTANA_CANCELACIONES);

  if (!hoja) {
    return { exito: true, cancelaciones: [] };
  }

  var datos = hoja.getDataRange().getValues();
  var cancelaciones = [];

  for (var i = 1; i < datos.length; i++) {
    var clienteFila = datos[i][0] ? datos[i][0].toString().trim() : "";

    if (clienteFila.toLowerCase() === nombreCliente.toLowerCase()) {
      cancelaciones.push({
        fecha: formatearValorFecha(datos[i][1]),
        hora: formatearValorHora(datos[i][2]),
        servicio: datos[i][3] ? datos[i][3].toString() : "",
        estado: datos[i][5] ? datos[i][5].toString() : "Pendiente",
        fechaSolicitud: datos[i][4] ? datos[i][4].toString() : ""
      });
    }
  }

  return { exito: true, cancelaciones: cancelaciones };
}

// ============================================================
// SOLICITAR CITA EXTRA
// Crea unha solicitude de cita extra pendente de confirmacion
// ============================================================
function solicitarCitaExtra(e, cuerpo) {
  if (cuerpo.token) {
    e.parameter = e.parameter || {};
    e.parameter.token = cuerpo.token;
  }
  var email = obtenerEmailDelToken(e);

  if (!email) {
    return { exito: false, mensaje: "Token no valido" };
  }

  var nombreCliente = obtenerNombreClientePorEmail(email);

  if (!nombreCliente) {
    return { exito: false, mensaje: "Cliente no encontrado" };
  }

  var hoja = obtenerOCrearHojaCitasExtra();

  var ahora = new Date();
  var fechaSolicitud = Utilities.formatDate(ahora, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");

  hoja.appendRow([
    sanitizarParaCelda(nombreCliente),
    sanitizarParaCelda(cuerpo.servicio || ""),
    sanitizarParaCelda(cuerpo.fecha || ""),
    sanitizarParaCelda(cuerpo.hora || ""),
    sanitizarParaCelda(cuerpo.nota || ""),
    sanitizarParaCelda(fechaSolicitud),
    "Pendente"
  ]);

  enviarTelegramAdmin("🔔 <b>Nova CITA EXTRA</b>\n" +
    "Cliente: " + nombreCliente + "\n" +
    "Servizo: " + (cuerpo.servicio || "-") + "\n" +
    "Data preferida: " + (cuerpo.fecha || "-") + " " + (cuerpo.hora || "") +
    (cuerpo.nota ? "\nNota: " + cuerpo.nota : ""));

  return { exito: true, mensaje: "Solicitude de cita extra enviada" };
}

// ============================================================
// OBTER CITAS POR FECHA (PARA COMPROBAR DISPOÑIBILIDADE)
// Devolve so as horas ocupadas, sen datos persoais dos clientes
// ============================================================
function obtenerCitasPorFecha(e) {
  var fecha = e.parameter.fecha;
  if (!fecha) return crearRespuesta({exito: false, mensaje: "Falta o parametro: fecha"});

  var hoja = obtenerHoja(PESTANA_CITAS);
  if (!hoja) return crearRespuesta({exito: true, citas: []});

  var datos = hoja.getDataRange().getValues();
  var citas = [];

  for (var i = 1; i < datos.length; i++) {
    if (!datos[i][0]) continue;
    var fechaFila = formatearValorFecha(datos[i][0]);
    if (fechaFila === fecha) {
      var cliente = datos[i][3] ? datos[i][3].toString().trim() : "";
      var esLibre = cliente.toLowerCase() === "libre" || cliente === "";
      citas.push({
        hora: formatearValorHora(datos[i][2]),
        estado: esLibre ? "libre" : "ocupado"
      });
    }
  }

  return {exito: true, citas: citas};
}

// ============================================================
// OBTENER TODAS LAS SOLICITUDES DE CANCELACION (ADMIN)
// ============================================================
function obtenerCancelaciones() {
  var hoja = obtenerHoja(PESTANA_CANCELACIONES);

  if (!hoja) {
    return { exito: true, cancelaciones: [] };
  }

  var datos = hoja.getDataRange().getValues();
  var cancelaciones = [];

  for (var i = 1; i < datos.length; i++) {
    if (datos[i][0] && datos[i][0].toString().trim() !== "") {
      cancelaciones.push({
        indice: i + 1,
        cliente: datos[i][0] ? datos[i][0].toString() : "",
        fechaCita: formatearValorFecha(datos[i][1]),
        horaCita: formatearValorHora(datos[i][2]),
        servicio: datos[i][3] ? datos[i][3].toString() : "",
        fechaSolicitud: datos[i][4] ? datos[i][4].toString() : "",
        estado: datos[i][5] ? datos[i][5].toString() : "Pendiente"
      });
    }
  }

  return { exito: true, cancelaciones: cancelaciones };
}

// ============================================================
// REGISTRAR TOKEN DE NOTIFICACIONES PUSH
// Guarda el token push del cliente en la columna E de Clientes
// ============================================================
function registrarTokenPush(e, cuerpo) {
  // Obtener el token de autenticacion del cuerpo del POST
  if (cuerpo.token) {
    e.parameter = e.parameter || {};
    e.parameter.token = cuerpo.token;
  }

  var email = obtenerEmailDelToken(e);

  if (!email) {
    return { exito: false, mensaje: "Token no valido" };
  }

  var tokenPush = cuerpo.token_push;

  if (!tokenPush) {
    return { exito: false, mensaje: "Falta el token push" };
  }

  var hoja = obtenerHoja(PESTANA_CLIENTES);
  var datos = hoja.getDataRange().getValues();

  // Verificar si la columna E (TokenPush) existe en la cabecera
  var cabeceras = datos[0];
  var columnaTokenPush = -1;

  for (var c = 0; c < cabeceras.length; c++) {
    if (cabeceras[c] && cabeceras[c].toString().trim() === "TokenPush") {
      columnaTokenPush = c;
      break;
    }
  }

  // Si no existe la columna, crearla
  if (columnaTokenPush === -1) {
    columnaTokenPush = 4; // Columna E (indice 4)
    hoja.getRange(1, columnaTokenPush + 1).setValue("TokenPush");
    hoja.getRange(1, columnaTokenPush + 1).setFontWeight("bold");
  }

  // Buscar el cliente por email y guardar el token
  for (var i = 1; i < datos.length; i++) {
    var emailHoja = datos[i][2] ? datos[i][2].toString().trim().toLowerCase() : "";

    if (emailHoja === email.toLowerCase()) {
      hoja.getRange(i + 1, columnaTokenPush + 1).setValue(tokenPush);
      return { exito: true, mensaje: "Token push registrado correctamente" };
    }
  }

  return { exito: false, mensaje: "Cliente no encontrado" };
}

// ============================================================
// ACTUALIZAR ESTADO DE UNA SOLICITUD DE CANCELACION (ADMIN)
// Si se aprueba, tambien elimina la cita de la hoja de citas
// Envia notificacion push al cliente sobre el resultado
// ============================================================
function actualizarCancelacion(cuerpo) {
  var indice = cuerpo.indice;
  var nuevoEstado = cuerpo.estado;

  if (!indice || !nuevoEstado) {
    return { exito: false, mensaje: "Faltan parametros: indice y estado son obligatorios" };
  }

  if (nuevoEstado !== "Aprobada" && nuevoEstado !== "Denegada") {
    return { exito: false, mensaje: "El estado debe ser 'Aprobada' o 'Denegada'" };
  }

  var hoja = obtenerHoja(PESTANA_CANCELACIONES);

  if (!hoja) {
    return { exito: false, mensaje: "No se encontro la hoja de cancelaciones" };
  }

  // Obtener el nombre del cliente de la solicitud antes de actualizar
  var datosSolicitud = hoja.getRange(indice, 1, 1, 5).getValues()[0];
  var nombreCliente = datosSolicitud[0] ? datosSolicitud[0].toString().trim() : "";

  hoja.getRange(indice, 6).setValue(nuevoEstado);

  if (nuevoEstado === "Aprobada") {
    var clienteCancelado = nombreCliente;
    var fechaCitaCancelada = datosSolicitud[1];
    var horaCitaCancelada = datosSolicitud[2] ? datosSolicitud[2].toString().trim() : "";

    eliminarCitaDeLaHoja(clienteCancelado, fechaCitaCancelada, horaCitaCancelada);
  }

  // Enviar notificacion push al cliente
  enviarNotificacionPushCliente(nombreCliente, nuevoEstado);

  return { exito: true, mensaje: "Solicitud actualizada a: " + nuevoEstado };
}

// ============================================================
// ENVIAR NOTIFICACION PUSH AO CLIENTE VIA FCM V1 API
// Usa a conta de servizo de Firebase para autenticarse
//
// CONFIGURACION NECESARIA:
// Engadir a propiedade FCM_PRIVATE_KEY nas propiedades do script
// co contido da clave privada do JSON da conta de servizo
// ============================================================
function enviarNotificacionPushCliente(nombreCliente, estado) {
  try {
    var tokenPush = obtenerTokenPushCliente(nombreCliente);

    if (!tokenPush) {
      Logger.log("Non se atopou token push para o cliente: " + nombreCliente);
      return;
    }

    var estadoTexto = estado.toLowerCase();
    var mensaxe = "A tua solicitude de cancelacion foi " + estadoTexto;

    var accessToken = obterAccessTokenFCM();
    if (!accessToken) {
      Logger.log("ERRO: Non se puido obter o token de acceso para FCM");
      return;
    }

    var projectId = "app-barberia-20e9d";
    var url = "https://fcm.googleapis.com/v1/projects/" + projectId + "/messages:send";

    var payload = {
      message: {
        token: tokenPush,
        notification: {
          title: "Peluqueria Raul",
          body: mensaxe
        },
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channel_id: "default"
          }
        },
        data: {
          tipo: "cancelacion",
          estado: estado
        }
      }
    };

    var opciones = {
      method: "post",
      contentType: "application/json",
      headers: {
        "Authorization": "Bearer " + accessToken
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var resposta = UrlFetchApp.fetch(url, opciones);
    Logger.log("FCM V1 resposta: " + resposta.getContentText());

  } catch (error) {
    Logger.log("Erro ao enviar notificacion push: " + error.message);
  }
}

// ============================================================
// OBTER ACCESS TOKEN PARA FCM V1 API
// Usa ScriptApp.getOAuthToken() co scope de Firebase Messaging
// O usuario que desprega o script debe ter permisos no proxecto Firebase
// ============================================================
function obterAccessTokenFCM() {
  try {
    return ScriptApp.getOAuthToken();
  } catch (error) {
    Logger.log("Erro ao obter access token FCM: " + error.message);
    return null;
  }
}

// ============================================================
// OBTENER TOKEN PUSH DE UN CLIENTE POR NOMBRE
// Busca en la columna TokenPush de la hoja Clientes
// ============================================================
function obtenerTokenPushCliente(nombreCliente) {
  var hoja = obtenerHoja(PESTANA_CLIENTES);
  var datos = hoja.getDataRange().getValues();

  // Buscar la columna TokenPush
  var cabeceras = datos[0];
  var columnaTokenPush = -1;

  for (var c = 0; c < cabeceras.length; c++) {
    if (cabeceras[c] && cabeceras[c].toString().trim() === "TokenPush") {
      columnaTokenPush = c;
      break;
    }
  }

  if (columnaTokenPush === -1) {
    return null;
  }

  // Buscar el cliente por nombre
  for (var i = 1; i < datos.length; i++) {
    var nombre = datos[i][0] ? datos[i][0].toString().trim() : "";

    if (nombre.toLowerCase() === nombreCliente.toLowerCase()) {
      var token = datos[i][columnaTokenPush];
      return token ? token.toString().trim() : null;
    }
  }

  return null;
}

// ============================================================
// ELIMINAR CITA DE LA HOJA DE CITAS
// ============================================================
function eliminarCitaDeLaHoja(cliente, fechaCita, horaCita) {
  var hoja = obtenerHoja(PESTANA_CITAS);

  if (!hoja) return;

  var datos = hoja.getDataRange().getValues();

  for (var i = datos.length - 1; i >= 1; i--) {
    var clienteFila = datos[i][3] ? datos[i][3].toString().trim() : "";
    var horaFila = datos[i][2] ? datos[i][2].toString().trim() : "";

    if (clienteFila.toLowerCase() === cliente.toLowerCase() &&
        horaFila === horaCita) {
      var fechaFila = datos[i][0];
      if (compararFechas(fechaFila, fechaCita)) {
        hoja.deleteRow(i + 1);
        return;
      }
    }
  }
}

// ============================================================
// LIBERAR CITA DA HOJA (POÑER "Libre" EN VEZ DE BORRAR)
// Mesma loxica que eliminarCitaDeLaHoja pero sen borrar a fila
// ============================================================
function liberarCitaDaHoja(cliente, fechaCita, horaCita) {
  var hoja = obtenerHoja(PESTANA_CITAS);

  if (!hoja) return;

  var datos = hoja.getDataRange().getValues();
  var horaBuscada = formatearValorHora(horaCita);
  var clienteBuscado = cliente.toString().trim().toLowerCase();

  // Buscar por cliente + hora entre citas futuras
  var hoxe = new Date();
  hoxe.setHours(0, 0, 0, 0);

  for (var i = 1; i < datos.length; i++) {
    var clienteFila = datos[i][3] ? datos[i][3].toString().trim().toLowerCase() : "";
    var horaFila = formatearValorHora(datos[i][2]);

    if (clienteFila === clienteBuscado && horaFila === horaBuscada) {
      var fechaFila = parsearFecha(datos[i][0]);
      if (fechaFila && fechaFila >= hoxe) {
        hoja.getRange(i + 1, 4).setValue("Libre");
        hoja.getRange(i + 1, 5).setValue("");
        return;
      }
    }
  }
}

// ============================================================
// OBTENER TODOS LOS CLIENTES (ADMIN)
// ============================================================
function obtenerClientes() {
  var hoja = obtenerHoja(PESTANA_CLIENTES);

  if (!hoja) {
    return { exito: false, mensaje: "No se encontro la hoja de clientes" };
  }

  var datos = hoja.getDataRange().getValues();
  var clientes = [];

  for (var i = 1; i < datos.length; i++) {
    if (datos[i][0] && datos[i][0].toString().trim() !== "") {
      clientes.push({
        indice: i + 1,
        nombre: datos[i][0] ? datos[i][0].toString() : "",
        totalCitas: datos[i][1] ? datos[i][1] : 0,
        email: datos[i][2] ? datos[i][2].toString() : "",
        telefono: datos[i][3] ? datos[i][3].toString() : ""
      });
    }
  }

  return { exito: true, clientes: clientes };
}

// ============================================================
// ACTUALIZAR EMAIL DE UN CLIENTE (ADMIN)
// ============================================================
function actualizarEmailCliente(cuerpo) {
  var indice = cuerpo.indice;
  var email = cuerpo.email;

  if (!indice) {
    return { exito: false, mensaje: "Falta el parametro: indice" };
  }

  if (email === undefined || email === null) {
    return { exito: false, mensaje: "Falta el parametro: email" };
  }

  // Validar formato de email
  var emailLimpio = email.toString().trim().toLowerCase();
  if (emailLimpio && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
    return { exito: false, mensaje: "Formato de email non valido" };
  }

  var hoja = obtenerHoja(PESTANA_CLIENTES);

  if (!hoja) {
    return { exito: false, mensaje: "No se encontro la hoja de clientes" };
  }

  hoja.getRange(indice, 3).setValue(sanitizarParaCelda(emailLimpio));

  return { exito: true, mensaje: "Email actualizado correctamente" };
}

// ============================================================
// ACTUALIZAR TELEFONO DE UN CLIENTE (ADMIN)
// ============================================================
function actualizarTelefonoCliente(cuerpo) {
  var indice = cuerpo.indice;
  var telefono = cuerpo.telefono;

  if (!indice) {
    return { exito: false, mensaje: "Falta o parametro: indice" };
  }

  if (telefono === undefined || telefono === null) {
    return { exito: false, mensaje: "Falta o parametro: telefono" };
  }

  var telefonoLimpio = telefono.toString().trim();

  var hoja = obtenerHoja(PESTANA_CLIENTES);

  if (!hoja) {
    return { exito: false, mensaje: "Non se atopou a folla de clientes" };
  }

  hoja.getRange(indice, 4).setValue(sanitizarParaCelda(telefonoLimpio));

  return { exito: true, mensaje: "Telefono actualizado correctamente" };
}

// ============================================================
// CREAR NOVO CLIENTE (ADMIN)
// ============================================================
function crearCliente(cuerpo) {
  var nombre = (cuerpo.nombre || "").toString().trim();
  var telefono = (cuerpo.telefono || "").toString().trim();
  var email = (cuerpo.email || "").toString().trim().toLowerCase();

  if (!nombre) {
    return { exito: false, mensaje: "O nome do cliente é obrigatorio" };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { exito: false, mensaje: "Formato de email non valido" };
  }

  var hoja = obtenerHoja(PESTANA_CLIENTES);
  if (!hoja) {
    return { exito: false, mensaje: "Non se atopou a folla de clientes" };
  }

  // Comprobar que non exista xa un cliente co mesmo nome
  var datos = hoja.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    var nomeFila = datos[i][0] ? datos[i][0].toString().trim().toLowerCase() : "";
    if (nomeFila === nombre.toLowerCase()) {
      return { exito: false, mensaje: "Xa existe un cliente con ese nome" };
    }
  }

  hoja.appendRow([
    sanitizarParaCelda(nombre),
    0, // Total Citas inicial
    sanitizarParaCelda(email),
    sanitizarParaCelda(telefono)
  ]);

  return { exito: true, mensaje: "Cliente creado correctamente" };
}

// ============================================================
// ASIGNAR CITA DIRECTA A UN CLIENTE (ADMIN)
// Similar a aprobar unha cita extra: substitue un slot "Libre" polo cliente
// ============================================================
function asignarCitaAdmin(cuerpo) {
  var nombreCliente = (cuerpo.cliente || "").toString().trim();
  var fecha = (cuerpo.fecha || "").toString().trim();
  var hora = (cuerpo.hora || "").toString().trim();
  var servicio = (cuerpo.servicio || "").toString().trim();
  var importe = cuerpo.importe;

  if (!nombreCliente || !fecha || !hora || !servicio) {
    return { exito: false, mensaje: "Faltan parametros: cliente, fecha, hora e servicio son obrigatorios" };
  }

  var hojaCitas = obtenerHoja(PESTANA_CITAS);
  if (!hojaCitas) {
    return { exito: false, mensaje: "Non se atopou a folla de citas" };
  }

  var datosCitas = hojaCitas.getDataRange().getValues();
  var fechaFormateada = formatearValorFecha(fecha);
  var horaFormateada = formatearValorHora(hora);
  var filaAtopada = -1;

  for (var i = 1; i < datosCitas.length; i++) {
    var fechaFila = formatearValorFecha(datosCitas[i][0]);
    var horaFila = formatearValorHora(datosCitas[i][2]);
    var clienteFila = datosCitas[i][3] ? datosCitas[i][3].toString().trim().toLowerCase() : "";

    if (fechaFila === fechaFormateada && horaFila === horaFormateada && (clienteFila === "libre" || clienteFila === "")) {
      filaAtopada = i + 1;
      break;
    }
  }

  if (filaAtopada > 0) {
    hojaCitas.getRange(filaAtopada, 4).setValue(sanitizarParaCelda(nombreCliente));
    hojaCitas.getRange(filaAtopada, 5).setValue(sanitizarParaCelda(servicio));
    if (importe !== undefined && importe !== null && importe !== "") {
      hojaCitas.getRange(filaAtopada, 6).setValue(importe);
    }
  } else {
    // Se non hai slot libre, engadir ao final
    var fechaObj = parsearFecha(fecha);
    var nomeDia = "";
    if (fechaObj) {
      var NOMES_DIAS = ['Domingo', 'Luns', 'Martes', 'Mercores', 'Xoves', 'Venres', 'Sabado'];
      nomeDia = NOMES_DIAS[fechaObj.getDay()];
    }
    hojaCitas.appendRow([
      fecha, nomeDia, hora,
      sanitizarParaCelda(nombreCliente),
      sanitizarParaCelda(servicio),
      importe || ""
    ]);
  }

  return { exito: true, mensaje: "Cita asignada correctamente" };
}

// ============================================================
// ACTUALIZAR PREFERENCIAS DUN CLIENTE (ADMIN)
// Equivalente a enviarPreferencias pero sen token Firebase,
// recibe directamente o nome do cliente
// ============================================================
function actualizarPreferenciasAdmin(cuerpo) {
  var nombreCliente = (cuerpo.cliente || "").toString().trim();
  if (!nombreCliente) {
    return { exito: false, mensaje: "Falta o parametro: cliente" };
  }

  var hoja = obtenerOCrearHojaPreferencias();
  var datos = hoja.getDataRange().getValues();

  var telefono = cuerpo.telefono || "";
  var servizos = (cuerpo.servizos || []).join(", ");
  var intervalo = cuerpo.intervalo || "";
  var luns = (cuerpo.luns || []).join(", ");
  var martes = (cuerpo.martes || []).join(", ");
  var mercores = (cuerpo.mercores || []).join(", ");
  var xoves = (cuerpo.xoves || []).join(", ");
  var venres = (cuerpo.venres || []).join(", ");
  var sabado = (cuerpo.sabado || []).join(", ");
  var cambioDisponibilidade = (cuerpo.cambioDisponibilidade || []).join(", ");
  var diaAlternativo = (cuerpo.diaAlternativo || []).join(", ");
  var outrasCondicions = cuerpo.outrasCondicions || "";
  var dataEnvio = Utilities.formatDate(new Date(), "Europe/Madrid", "dd/MM/yyyy HH:mm:ss");

  var fila = [
    sanitizarParaCelda(nombreCliente),
    sanitizarParaCelda(telefono),
    sanitizarParaCelda(servizos),
    sanitizarParaCelda(intervalo),
    sanitizarParaCelda(luns),
    sanitizarParaCelda(martes),
    sanitizarParaCelda(mercores),
    sanitizarParaCelda(xoves),
    sanitizarParaCelda(venres),
    sanitizarParaCelda(sabado),
    sanitizarParaCelda(cambioDisponibilidade),
    sanitizarParaCelda(diaAlternativo),
    sanitizarParaCelda(outrasCondicions),
    sanitizarParaCelda(dataEnvio)
  ];

  var filaExistente = -1;
  for (var i = 1; i < datos.length; i++) {
    var clienteFila = datos[i][0] ? datos[i][0].toString().trim().toLowerCase() : "";
    if (clienteFila === nombreCliente.toLowerCase()) {
      filaExistente = i + 1;
      break;
    }
  }

  if (filaExistente > 0) {
    hoja.getRange(filaExistente, 1, 1, fila.length).setValues([fila]);
  } else {
    hoja.appendRow(fila);
  }

  // Propagar telefono a folla Clientes (columna D) se se proporcionou
  if (telefono && telefono.toString().trim() !== "") {
    try {
      var hojaClientes = obtenerHoja(PESTANA_CLIENTES);
      if (hojaClientes) {
        var datosCli = hojaClientes.getDataRange().getValues();
        for (var k = 1; k < datosCli.length; k++) {
          var nomeFila = datosCli[k][0] ? datosCli[k][0].toString().trim().toLowerCase() : "";
          if (nomeFila === nombreCliente.toLowerCase()) {
            hojaClientes.getRange(k + 1, 4).setValue(sanitizarParaCelda(telefono.toString().trim()));
            break;
          }
        }
      }
    } catch (e) {
      Logger.log("Erro propagando telefono a Clientes: " + e.message);
    }
  }

  return { exito: true, mensaje: "Preferencias gardadas correctamente" };
}

// ============================================================
// OBTENER TODAS LAS CITAS PROXIMAS (ADMIN)
// Sin filtrar por cliente
// ============================================================
function obtenerTodasCitasAdmin() {
  var hoja = obtenerHoja(PESTANA_CITAS);

  if (!hoja) {
    return { exito: false, mensaje: "No se encontro la hoja de citas" };
  }

  var datos = hoja.getDataRange().getValues();
  var hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  var citas = [];

  for (var i = 1; i < datos.length; i++) {
    if (!datos[i][0]) continue;

    var fechaCita = parsearFecha(datos[i][0]);

    if (fechaCita && fechaCita >= hoy) {
      citas.push({
        fecha: formatearValorFecha(datos[i][0]),
        dia: datos[i][1] ? datos[i][1].toString() : "",
        hora: formatearValorHora(datos[i][2]),
        cliente: datos[i][3] ? datos[i][3].toString() : "",
        servicio: datos[i][4] ? datos[i][4].toString() : "",
        importe: datos[i][5] ? datos[i][5] : 0
      });
    }
  }

  citas.sort(function (a, b) {
    var fechaA = parsearFecha(a.fecha);
    var fechaB = parsearFecha(b.fecha);
    if (fechaA.getTime() !== fechaB.getTime()) {
      return fechaA - fechaB;
    }
    return a.hora.localeCompare(b.hora);
  });

  return { exito: true, citas: citas };
}

// ============================================================
// REDIRECCION OAUTH
// ============================================================
function manejarRedirectOAuth() {
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<title>Redirigiendo...</title>' +
    '<style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#1A1A2E;color:white;text-align:center;}</style>' +
    '</head><body>' +
    '<div id="msg"><p>Redirigiendo a la aplicacion...</p></div>' +
    '<script>' +
    '(function(){' +
    '  var hash = window.location.hash;' +
    '  if (!hash || hash.length < 2) {' +
    '    var url = window.location.href;' +
    '    var idx = url.indexOf("access_token");' +
    '    if (idx !== -1) {' +
    '      var params = url.substring(idx);' +
    '      window.location.href = "peluqueria-raul-app://oauth?" + params;' +
    '      return;' +
    '    }' +
    '    document.getElementById("msg").innerHTML = "<p>Esperando autenticacion...</p>";' +
    '    return;' +
    '  }' +
    '  var fragment = hash.substring(1);' +
    '  window.location.href = "peluqueria-raul-app://oauth?" + fragment;' +
    '})();' +
    '</script></body></html>';

  return HtmlService.createHtmlOutput(html)
    .setTitle("Redirigiendo...")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================================
// OBTENER TODAS AS SOLICITUDES DE CITA EXTRA (ADMIN)
// ============================================================
function obtenerCitasExtra() {
  var hoja = obtenerHoja(PESTANA_CITAS_EXTRA);

  if (!hoja) {
    return { exito: true, citasExtra: [] };
  }

  var datos = hoja.getDataRange().getValues();
  var citasExtra = [];

  for (var i = 1; i < datos.length; i++) {
    if (datos[i][0] && datos[i][0].toString().trim() !== "") {
      citasExtra.push({
        indice: i + 1,
        cliente: datos[i][0] ? datos[i][0].toString() : "",
        servizo: datos[i][1] ? datos[i][1].toString() : "",
        fechaPreferida: formatearValorFecha(datos[i][2]),
        horaPreferida: formatearValorHora(datos[i][3]),
        nota: datos[i][4] ? datos[i][4].toString() : "",
        fechaSolicitude: datos[i][5] ? datos[i][5].toString() : "",
        estado: datos[i][6] ? datos[i][6].toString() : "Pendente"
      });
    }
  }

  return { exito: true, citasExtra: citasExtra };
}

// ============================================================
// ACTUALIZAR ESTADO DUNHA SOLICITUDE DE CITA EXTRA (ADMIN)
// Se se aproba, engade a cita a folla "Citas Peluqueria"
// Envia notificacion push ao cliente sobre o resultado
// ============================================================
function actualizarCitaExtra(cuerpo) {
  var indice = cuerpo.indice;
  var nuevoEstado = cuerpo.estado;

  if (!indice || !nuevoEstado) {
    return { exito: false, mensaje: "Faltan parametros: indice e estado son obrigatorios" };
  }

  if (nuevoEstado !== "Aprobada" && nuevoEstado !== "Denegada") {
    return { exito: false, mensaje: "O estado debe ser 'Aprobada' ou 'Denegada'" };
  }

  var hoja = obtenerHoja(PESTANA_CITAS_EXTRA);

  if (!hoja) {
    return { exito: false, mensaje: "Non se atopou a folla de solicitudes de cita extra" };
  }

  // Obter os datos da solicitude antes de actualizar
  var datosSolicitude = hoja.getRange(indice, 1, 1, 7).getValues()[0];
  var nomeCliente = datosSolicitude[0] ? datosSolicitude[0].toString().trim() : "";

  // Actualizar o estado na columna 7 (Estado)
  hoja.getRange(indice, 7).setValue(nuevoEstado);

  // Se se aproba, engadir a cita a folla de citas
  if (nuevoEstado === "Aprobada") {
    var servizo = datosSolicitude[1] ? datosSolicitude[1].toString() : "";
    var fechaPreferida = datosSolicitude[2];
    var horaPreferida = datosSolicitude[3];

    var hojaCitas = obtenerHoja(PESTANA_CITAS);
    if (hojaCitas) {
      var datosCitas = hojaCitas.getDataRange().getValues();
      var fechaFormateada = formatearValorFecha(fechaPreferida);
      var horaFormateada = formatearValorHora(horaPreferida);
      var filaAtopada = -1;

      // Buscar a fila "Libre" que coincida con data e hora
      for (var i = 1; i < datosCitas.length; i++) {
        var fechaFila = formatearValorFecha(datosCitas[i][0]);
        var horaFila = formatearValorHora(datosCitas[i][2]);
        var clienteFila = datosCitas[i][3] ? datosCitas[i][3].toString().trim().toLowerCase() : "";

        if (fechaFila === fechaFormateada && horaFila === horaFormateada && (clienteFila === "libre" || clienteFila === "")) {
          filaAtopada = i + 1; // 1-indexed
          break;
        }
      }

      if (filaAtopada > 0) {
        // Substituir o slot "Libre" co nome do cliente e servizo
        hojaCitas.getRange(filaAtopada, 4).setValue(nomeCliente); // Columna D: Cliente
        hojaCitas.getRange(filaAtopada, 5).setValue(servizo);     // Columna E: Servizo
      } else {
        // Se non hai slot "Libre" para esa data/hora, engadir ao final
        var fechaObj = parsearFecha(fechaPreferida);
        var nomeDia = "";
        if (fechaObj) {
          var NOMES_DIAS = ['Domingo', 'Luns', 'Martes', 'Mercores', 'Xoves', 'Venres', 'Sabado'];
          nomeDia = NOMES_DIAS[fechaObj.getDay()];
        }
        hojaCitas.appendRow([fechaPreferida, nomeDia, horaPreferida, nomeCliente, servizo, ""]);
      }
    }
  }

  // Enviar notificacion push ao cliente
  try {
    var tokenPush = obtenerTokenPushCliente(nomeCliente);
    if (tokenPush) {
      var estadoTexto = nuevoEstado.toLowerCase();
      var mensaxe = "A tua solicitude de cita extra foi " + estadoTexto;

      var accessToken = obterAccessTokenFCM();
      if (accessToken) {
        var projectId = "app-barberia-20e9d";
        var url = "https://fcm.googleapis.com/v1/projects/" + projectId + "/messages:send";

        var payload = {
          message: {
            token: tokenPush,
            notification: {
              title: "Peluqueria Raul",
              body: mensaxe
            },
            android: {
              priority: "high",
              notification: {
                sound: "default",
                channel_id: "default"
              }
            },
            data: {
              tipo: "cita_extra",
              estado: nuevoEstado
            }
          }
        };

        UrlFetchApp.fetch(url, {
          method: "post",
          contentType: "application/json",
          headers: { "Authorization": "Bearer " + accessToken },
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        });
      }
    }
  } catch (error) {
    Logger.log("Erro ao enviar notificacion push de cita extra: " + error.message);
  }

  return { exito: true, mensaje: "Solicitude de cita extra actualizada a: " + nuevoEstado };
}

// ============================================================
// OBTENER MIS REASIGNACIONES (CLIENTE)
// Devolve as reasignacións do cliente autenticado
// ============================================================
function obtenerMisReasignaciones(e) {
  var email = obtenerEmailDelToken(e);

  if (!email) {
    return { exito: false, mensaje: "Token non valido" };
  }

  var nombreCliente = obtenerNombreClientePorEmail(email);

  if (!nombreCliente) {
    return { exito: false, mensaje: "Cliente non atopado" };
  }

  var hoja = obtenerHoja(PESTANA_REASIGNACIONES);

  if (!hoja) {
    return { exito: true, reasignaciones: [] };
  }

  var datos = hoja.getDataRange().getValues();
  var reasignaciones = [];

  for (var i = 1; i < datos.length; i++) {
    var clienteFila = datos[i][0] ? datos[i][0].toString().trim() : "";

    if (clienteFila.toLowerCase() === nombreCliente.toLowerCase()) {
      reasignaciones.push({
        fecha: formatearValorFecha(datos[i][1]),
        hora: formatearValorHora(datos[i][2]),
        servicio: datos[i][3] ? datos[i][3].toString() : "",
        motivo: datos[i][4] ? datos[i][4].toString() : "",
        estado: datos[i][7] ? datos[i][7].toString() : "Pendente",
        fechaSolicitud: datos[i][6] ? datos[i][6].toString() : ""
      });
    }
  }

  return { exito: true, reasignaciones: reasignaciones };
}

// ============================================================
// SOLICITAR REASIGNACION DUNHA CITA
// O cliente pide que o barbeiro lle cambie a data/hora
// ============================================================
function solicitarReasignacion(e, cuerpo) {
  if (cuerpo.token) {
    e.parameter = e.parameter || {};
    e.parameter.token = cuerpo.token;
  }
  var email = obtenerEmailDelToken(e);

  if (!email) {
    return { exito: false, mensaje: "Token non valido" };
  }

  var nombreCliente = obtenerNombreClientePorEmail(email);

  if (!nombreCliente) {
    return { exito: false, mensaje: "Cliente non atopado" };
  }

  var hoja = obtenerOCrearHojaReasignaciones();

  var ahora = new Date();
  var fechaSolicitud = Utilities.formatDate(ahora, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");

  hoja.appendRow([
    sanitizarParaCelda(nombreCliente),
    sanitizarParaCelda(cuerpo.fechaCita || ""),
    sanitizarParaCelda(cuerpo.horaCita || ""),
    sanitizarParaCelda(cuerpo.servicio || ""),
    sanitizarParaCelda(cuerpo.motivo || ""),
    sanitizarParaCelda(cuerpo.comentario || ""),
    sanitizarParaCelda(fechaSolicitud),
    "Pendente"
  ]);

  enviarTelegramAdmin("🔔 <b>Nova REASIGNACIÓN</b>\n" +
    "Cliente: " + nombreCliente + "\n" +
    "Cita actual: " + (cuerpo.fechaCita || "-") + " " + (cuerpo.horaCita || "") + "\n" +
    "Servizo: " + (cuerpo.servicio || "-") +
    (cuerpo.motivo ? "\nMotivo: " + cuerpo.motivo : "") +
    (cuerpo.comentario ? "\nComentario: " + cuerpo.comentario : ""));

  return { exito: true, mensaje: "Solicitude de reasignacion enviada" };
}

// ============================================================
// OBTER TODAS AS SOLICITUDES DE REASIGNACION (ADMIN)
// ============================================================
function obtenerReasignaciones() {
  var hoja = obtenerHoja(PESTANA_REASIGNACIONES);

  if (!hoja) {
    return { exito: true, reasignaciones: [] };
  }

  var datos = hoja.getDataRange().getValues();
  var reasignaciones = [];

  for (var i = 1; i < datos.length; i++) {
    if (datos[i][0] && datos[i][0].toString().trim() !== "") {
      reasignaciones.push({
        indice: i + 1,
        cliente: datos[i][0] ? datos[i][0].toString() : "",
        fechaCita: formatearValorFecha(datos[i][1]),
        horaCita: formatearValorHora(datos[i][2]),
        servicio: datos[i][3] ? datos[i][3].toString() : "",
        motivo: datos[i][4] ? datos[i][4].toString() : "",
        comentario: datos[i][5] ? datos[i][5].toString() : "",
        fechaSolicitude: datos[i][6] ? datos[i][6].toString() : "",
        estado: datos[i][7] ? datos[i][7].toString() : "Pendente"
      });
    }
  }

  return { exito: true, reasignaciones: reasignaciones };
}

// ============================================================
// ACTUALIZAR ESTADO DUNHA SOLICITUDE DE REASIGNACION (ADMIN)
// ============================================================
function actualizarReasignacion(cuerpo) {
  var indice = cuerpo.indice;
  var nuevoEstado = cuerpo.estado;

  if (!indice || !nuevoEstado) {
    return { exito: false, mensaje: "Faltan parametros: indice e estado son obrigatorios" };
  }

  if (nuevoEstado !== "Aprobada" && nuevoEstado !== "Denegada") {
    return { exito: false, mensaje: "O estado debe ser 'Aprobada' ou 'Denegada'" };
  }

  var hoja = obtenerHoja(PESTANA_REASIGNACIONES);

  if (!hoja) {
    return { exito: false, mensaje: "Non se atopou a folla de reasignacions" };
  }

  var datosSolicitude = hoja.getRange(indice, 1, 1, 8).getDisplayValues()[0];
  var nomeCliente = datosSolicitude[0] ? datosSolicitude[0].trim() : "";
  var fechaCitaOrixinal = datosSolicitude[1] ? datosSolicitude[1].trim() : "";
  var horaCitaOrixinal = datosSolicitude[2] ? datosSolicitude[2].trim() : "";
  var servizoCita = datosSolicitude[3] ? datosSolicitude[3].trim() : "";

  hoja.getRange(indice, 8).setValue(nuevoEstado);

  // Se se aproba, mover a cita ao novo slot
  if (nuevoEstado === "Aprobada" && cuerpo.nuevaFecha && cuerpo.nuevaHora) {
    var hojaCitas = obtenerHoja(PESTANA_CITAS);
    if (hojaCitas) {
      // Liberar a cita orixinal usando getDisplayValues para evitar problemas de timezone
      var hojaCitasLib = obtenerHoja(PESTANA_CITAS);
      if (hojaCitasLib) {
        var displayVals = hojaCitasLib.getDataRange().getDisplayValues();
        for (var il = 1; il < displayVals.length; il++) {
          var clDisplay = displayVals[il][3] ? displayVals[il][3].trim() : "";
          var horaDisplay = displayVals[il][2] ? displayVals[il][2].trim() : "";
          if (clDisplay.toLowerCase() === nomeCliente.toLowerCase() && horaDisplay === horaCitaOrixinal) {
            hojaCitasLib.getRange(il + 1, 4).setValue("Libre");
            hojaCitasLib.getRange(il + 1, 5).setValue("");
            break;
          }
        }
      }

      // Asignar o novo slot
      datosCitas = hojaCitas.getDataRange().getValues();
      var nuevaFecha = cuerpo.nuevaFecha;
      var nuevaHora = cuerpo.nuevaHora;
      var filaAtopada = -1;

      for (var j = 1; j < datosCitas.length; j++) {
        var fechaFila = formatearValorFecha(datosCitas[j][0]);
        var horaFilaJ = formatearValorHora(datosCitas[j][2]);
        var clienteFilaJ = datosCitas[j][3] ? datosCitas[j][3].toString().trim().toLowerCase() : "";
        if (fechaFila === nuevaFecha && horaFilaJ === nuevaHora && (clienteFilaJ === "libre" || clienteFilaJ === "")) {
          filaAtopada = j + 1;
          break;
        }
      }

      if (filaAtopada > 0) {
        hojaCitas.getRange(filaAtopada, 4).setValue(nomeCliente);
        hojaCitas.getRange(filaAtopada, 5).setValue(servizoCita);
      }
    }
  }

  // Enviar notificacion push ao cliente
  try {
    var tokenPush = obtenerTokenPushCliente(nomeCliente);
    if (tokenPush) {
      var estadoTexto = nuevoEstado.toLowerCase();
      var mensaxe = "A tua solicitude de reasignacion foi " + estadoTexto;

      var accessToken = obterAccessTokenFCM();
      if (accessToken) {
        var projectId = "app-barberia-20e9d";
        var url = "https://fcm.googleapis.com/v1/projects/" + projectId + "/messages:send";

        var payload = {
          message: {
            token: tokenPush,
            notification: {
              title: "Peluqueria Raul",
              body: mensaxe
            },
            android: {
              priority: "high",
              notification: {
                sound: "default",
                channel_id: "default"
              }
            },
            data: {
              tipo: "reasignacion",
              estado: nuevoEstado
            }
          }
        };

        UrlFetchApp.fetch(url, {
          method: "post",
          contentType: "application/json",
          headers: { "Authorization": "Bearer " + accessToken },
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        });
      }
    }
  } catch (error) {
    Logger.log("Erro ao enviar notificacion push de reasignacion: " + error.message);
  }

  return { exito: true, mensaje: "Solicitude de reasignacion actualizada a: " + nuevoEstado };
}

function obtenerOCrearHojaReasignaciones() {
  var libroHojas = SpreadsheetApp.openById(obtenerIdHoja());
  var hoja = libroHojas.getSheetByName(PESTANA_REASIGNACIONES);

  if (!hoja) {
    hoja = libroHojas.insertSheet(PESTANA_REASIGNACIONES);
    hoja.appendRow(["Cliente", "Fecha cita", "Hora cita", "Servicio", "Motivo", "Comentario", "Fecha solicitud", "Estado"]);
    hoja.getRange(1, 1, 1, 8).setFontWeight("bold");
  }

  return hoja;
}

// ============================================================
// ENVIAR PREFERENCIAS DE CITAS
// Garda ou actualiza as preferencias do cliente na folla
// "Preferencias Clientes"
// ============================================================
function enviarPreferencias(e, cuerpo) {
  if (cuerpo.token) {
    e.parameter = e.parameter || {};
    e.parameter.token = cuerpo.token;
  }
  var email = obtenerEmailDelToken(e);

  if (!email) {
    return { exito: false, mensaje: "Token non valido" };
  }

  var nombreCliente = obtenerNombreClientePorEmail(email);

  if (!nombreCliente) {
    return { exito: false, mensaje: "Cliente non atopado" };
  }

  var hoja = obtenerOCrearHojaPreferencias();
  var datos = hoja.getDataRange().getValues();

  // Preparar valores para a fila
  var telefono = cuerpo.telefono || "";
  var servizos = (cuerpo.servizos || []).join(", ");
  var intervalo = cuerpo.intervalo || "";
  var luns = (cuerpo.luns || []).join(", ");
  var martes = (cuerpo.martes || []).join(", ");
  var mercores = (cuerpo.mercores || []).join(", ");
  var xoves = (cuerpo.xoves || []).join(", ");
  var venres = (cuerpo.venres || []).join(", ");
  var sabado = (cuerpo.sabado || []).join(", ");
  var cambioDisponibilidade = (cuerpo.cambioDisponibilidade || []).join(", ");
  var diaAlternativo = (cuerpo.diaAlternativo || []).join(", ");
  var outrasCondicions = cuerpo.outrasCondicions || "";
  var dataEnvio = Utilities.formatDate(new Date(), "Europe/Madrid", "dd/MM/yyyy HH:mm:ss");

  var fila = [
    sanitizarParaCelda(nombreCliente),
    sanitizarParaCelda(telefono),
    sanitizarParaCelda(servizos),
    sanitizarParaCelda(intervalo),
    sanitizarParaCelda(luns),
    sanitizarParaCelda(martes),
    sanitizarParaCelda(mercores),
    sanitizarParaCelda(xoves),
    sanitizarParaCelda(venres),
    sanitizarParaCelda(sabado),
    sanitizarParaCelda(cambioDisponibilidade),
    sanitizarParaCelda(diaAlternativo),
    sanitizarParaCelda(outrasCondicions),
    sanitizarParaCelda(dataEnvio)
  ];

  // Buscar se o cliente xa ten unha fila existente
  var filaExistente = -1;
  for (var i = 1; i < datos.length; i++) {
    var clienteFila = datos[i][0] ? datos[i][0].toString().trim().toLowerCase() : "";
    if (clienteFila === nombreCliente.toLowerCase()) {
      filaExistente = i + 1; // +1 porque getRange usa indices desde 1
      break;
    }
  }

  if (filaExistente > 0) {
    // Actualizar fila existente
    hoja.getRange(filaExistente, 1, 1, fila.length).setValues([fila]);
  } else {
    // Engadir nova fila
    hoja.appendRow(fila);
  }

  return { exito: true, mensaje: "Preferencias gardadas correctamente" };
}

function obtenerOCrearHojaPreferencias() {
  var libroHojas = SpreadsheetApp.openById(obtenerIdHoja());
  var hoja = libroHojas.getSheetByName(PESTANA_PREFERENCIAS);

  if (!hoja) {
    hoja = libroHojas.insertSheet(PESTANA_PREFERENCIAS);
    hoja.appendRow([
      "Cliente",
      "Telefono",
      "Servizos",
      "Intervalo",
      "Luns",
      "Martes",
      "Mercores",
      "Xoves",
      "Venres",
      "Sabado",
      "Cambio dispoñibilidade",
      "Dia alternativo",
      "Outras condicions",
      "Data envio"
    ]);
    hoja.getRange(1, 1, 1, 14).setFontWeight("bold");
  }

  return hoja;
}

// ============================================================
// OBTER PREFERENCIAS DUN CLIENTE POR NOME (ADMIN)
// ============================================================
function obtenerPreferenciasCliente(e) {
  var nomeCliente = e.parameter.cliente;
  if (!nomeCliente) return { exito: true, preferencias: null };

  var hoja = obtenerHoja(PESTANA_PREFERENCIAS);
  if (!hoja) return { exito: true, preferencias: null };

  var datos = hoja.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    var clienteFila = datos[i][0] ? datos[i][0].toString().trim().toLowerCase() : "";
    if (clienteFila === nomeCliente.toLowerCase()) {
      return {
        exito: true,
        preferencias: {
          telefono: datos[i][1] ? datos[i][1].toString() : "",
          servizos: datos[i][2] ? datos[i][2].toString() : "",
          intervalo: datos[i][3] ? datos[i][3].toString() : "",
          luns: datos[i][4] ? datos[i][4].toString() : "",
          martes: datos[i][5] ? datos[i][5].toString() : "",
          mercores: datos[i][6] ? datos[i][6].toString() : "",
          xoves: datos[i][7] ? datos[i][7].toString() : "",
          venres: datos[i][8] ? datos[i][8].toString() : "",
          sabado: datos[i][9] ? datos[i][9].toString() : "",
          cambioDisponibilidade: datos[i][10] ? datos[i][10].toString() : "",
          diaAlternativo: datos[i][11] ? datos[i][11].toString() : "",
          outrasCondicions: datos[i][12] ? datos[i][12].toString() : ""
        }
      };
    }
  }
  return { exito: true, preferencias: null };
}

// ============================================================
// OBTER SLOTS DISPOÑIBLES DUNHA DATA (ADMIN)
// Devolve todos os slots con estado libre/ocupado
// ============================================================
function obtenerSlotsFecha(e) {
  var fecha = e.parameter.fecha;
  if (!fecha) return { exito: false, mensaje: "Falta o parametro: fecha" };

  var hoja = obtenerHoja(PESTANA_CITAS);
  if (!hoja) return { exito: true, slots: [] };

  var datos = hoja.getDataRange().getValues();
  var slots = [];

  for (var i = 1; i < datos.length; i++) {
    if (!datos[i][0]) continue;
    var fechaFila = formatearValorFecha(datos[i][0]);
    if (fechaFila === fecha) {
      var cliente = datos[i][3] ? datos[i][3].toString().trim() : "";
      var esLibre = cliente.toLowerCase() === "libre" || cliente === "";
      slots.push({
        hora: formatearValorHora(datos[i][2]),
        estado: esLibre ? "libre" : "ocupado",
        cliente: esLibre ? "" : cliente
      });
    }
  }

  return { exito: true, slots: slots };
}

// ============================================================
// VERIFICACION DE ADMIN E SANITIZACION
// ============================================================

// Verificar clave admin
function verificarAdmin(e, cuerpo) {
  var claveAdmin = PropertiesService.getScriptProperties().getProperty("ADMIN_KEY");
  if (!claveAdmin) {
    Logger.log("ERRO: ADMIN_KEY non configurada nas propiedades do script");
    return false;
  }
  var claveRecibida = "";
  if (cuerpo && cuerpo.admin_key) {
    claveRecibida = cuerpo.admin_key;
  } else if (e && e.parameter && e.parameter.admin_key) {
    claveRecibida = e.parameter.admin_key;
  }
  return claveRecibida === claveAdmin;
}

// Sanitizar inputs para evitar inxeccion de formulas en Google Sheets
function sanitizarParaCelda(valor) {
  if (valor === null || valor === undefined) return "";
  var texto = valor.toString();
  if (/^[=+\-@]/.test(texto)) {
    return "'" + texto;
  }
  return texto;
}

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function obtenerHoja(nombrePestana) {
  var libroHojas = SpreadsheetApp.openById(obtenerIdHoja());
  return libroHojas.getSheetByName(nombrePestana);
}

function obtenerIdHoja() {
  var id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) {
    throw new Error("No se ha configurado el ID de la hoja de calculo en las propiedades del script");
  }
  return id;
}

function obtenerOCrearHojaCancelaciones() {
  var libroHojas = SpreadsheetApp.openById(obtenerIdHoja());
  var hoja = libroHojas.getSheetByName(PESTANA_CANCELACIONES);

  if (!hoja) {
    hoja = libroHojas.insertSheet(PESTANA_CANCELACIONES);
    hoja.appendRow(["Cliente", "Fecha cita", "Hora cita", "Servicio", "Fecha solicitud", "Estado"]);
    hoja.getRange(1, 1, 1, 6).setFontWeight("bold");
  }

  return hoja;
}

function obtenerOCrearHojaCitasExtra() {
  var libroHojas = SpreadsheetApp.openById(obtenerIdHoja());
  var hoja = libroHojas.getSheetByName(PESTANA_CITAS_EXTRA);

  if (!hoja) {
    hoja = libroHojas.insertSheet(PESTANA_CITAS_EXTRA);
    hoja.appendRow(["Cliente", "Servicio", "Fecha preferida", "Hora preferida", "Nota", "Fecha solicitud", "Estado"]);
    hoja.getRange(1, 1, 1, 7).setFontWeight("bold");
  }

  return hoja;
}

function obtenerNombreClientePorEmail(email) {
  var hoja = obtenerHoja(PESTANA_CLIENTES);
  var datos = hoja.getDataRange().getValues();

  for (var i = 1; i < datos.length; i++) {
    var emailHoja = datos[i][2] ? datos[i][2].toString().trim().toLowerCase() : "";

    if (emailHoja === email.toLowerCase()) {
      return datos[i][0].toString().trim();
    }
  }

  return null;
}

// ============================================================
// VERIFICACION DE TOKEN DE FIREBASE
// Valida o token contra Firebase Auth REST API
// ============================================================
function obtenerEmailDelToken(e) {
  try {
    var tokenRaw = e.parameter.token || "";
    if (!tokenRaw && e.parameter.authorization) {
      tokenRaw = e.parameter.authorization;
    }
    var token = tokenRaw.replace("Bearer ", "").trim();
    if (!token) return null;

    var partes = token.split(".");
    if (partes.length !== 3) return null;

    // Verificar o token contra Firebase Auth REST API
    var apiKey = PropertiesService.getScriptProperties().getProperty("FIREBASE_API_KEY");
    if (!apiKey) {
      Logger.log("ERRO: FIREBASE_API_KEY non configurada nas propiedades do script");
      return null;
    }

    var url = "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + apiKey;
    var resposta = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ idToken: token }),
      muteHttpExceptions: true
    });

    if (resposta.getResponseCode() !== 200) {
      Logger.log("Token de Firebase non valido. Codigo HTTP: " + resposta.getResponseCode());
      return null;
    }

    var datos = JSON.parse(resposta.getContentText());
    if (!datos.users || datos.users.length === 0) return null;

    var email = datos.users[0].email;
    return email ? email.toLowerCase() : null;

  } catch (error) {
    Logger.log("Erro ao verificar token de Firebase: " + error.message);
    return null;
  }
}

// ============================================================
// PARSEO Y COMPARACION DE FECHAS
// ============================================================
function parsearFecha(valorFecha) {
  if (valorFecha instanceof Date) {
    var fecha = new Date(valorFecha);
    fecha.setHours(0, 0, 0, 0);
    return fecha;
  }

  var textoFecha = valorFecha.toString().trim();
  var partes = textoFecha.split("/");

  if (partes.length !== 3) {
    return null;
  }

  var dia = parseInt(partes[0], 10);
  var mes = parseInt(partes[1], 10) - 1;
  var anio = parseInt(partes[2], 10);

  var fecha = new Date(anio, mes, dia);
  fecha.setHours(0, 0, 0, 0);

  return fecha;
}

// Formatea un valor de hora (Date o string) a formato "HH:MM"
function formatearValorHora(valor) {
  if (valor instanceof Date) {
    // Usar Utilities.formatDate para respectar a zona horaria do spreadsheet
    try {
      return Utilities.formatDate(valor, "Europe/Madrid", "HH:mm");
    } catch (e) {
      var horas = ("0" + valor.getHours()).slice(-2);
      var minutos = ("0" + valor.getMinutes()).slice(-2);
      return horas + ":" + minutos;
    }
  }
  if (valor) {
    var texto = valor.toString().trim();
    // Si ya tiene formato HH:MM, devolver tal cual
    if (/^\d{1,2}:\d{2}$/.test(texto)) {
      return texto.length === 4 ? "0" + texto : texto;
    }
    return texto;
  }
  return "";
}

function formatearValorFecha(valor) {
  if (valor instanceof Date) {
    var dia = ("0" + valor.getDate()).slice(-2);
    var mes = ("0" + (valor.getMonth() + 1)).slice(-2);
    var anio = valor.getFullYear();
    return dia + "/" + mes + "/" + anio;
  }
  return valor ? valor.toString() : "";
}

function compararFechas(fecha1, fecha2) {
  var f1 = parsearFecha(fecha1);
  var f2 = parsearFecha(fecha2);

  if (!f1 || !f2) return false;

  return f1.getTime() === f2.getTime();
}

// ============================================================
// RECORDATORIO SEMANAL DE CITAS
// Executa diariamente, envia notificacion push aos clientes
// que teñen unha cita dentro de 7 dias
//
// CONFIGURACION:
// No editor de Apps Script, ir a "Activadores" (icono do reloxo)
// Engadir activador: funcion=enviarRecordatoriosSemanais,
// evento=Temporizador, tipo=Dia, hora=09:00-10:00
// ============================================================
function enviarRecordatoriosSemanais() {
  var hoja = obtenerHoja(PESTANA_CITAS);
  if (!hoja) return;

  var datos = hoja.getDataRange().getValues();
  var hoxe = new Date();
  hoxe.setHours(0, 0, 0, 0);

  // Data dentro de 7 dias
  var dentroDeUnhaSemana = new Date(hoxe);
  dentroDeUnhaSemana.setDate(dentroDeUnhaSemana.getDate() + 7);

  var NOMES_DIAS = ['Domingo', 'Luns', 'Martes', 'Mercores', 'Xoves', 'Venres', 'Sabado'];
  var NOMES_MESES = ['xaneiro', 'febreiro', 'marzo', 'abril', 'maio', 'xuno', 'xullo', 'agosto', 'setembro', 'outubro', 'novembro', 'decembro'];

  for (var i = 1; i < datos.length; i++) {
    if (!datos[i][0] || !datos[i][3]) continue;

    var fechaCita = parsearFecha(datos[i][0]);
    if (!fechaCita) continue;

    // Comprobar se a cita e exactamente dentro de 7 dias
    if (fechaCita.getTime() === dentroDeUnhaSemana.getTime()) {
      var nomeCliente = datos[i][3].toString().trim();
      var hora = formatearValorHora(datos[i][2]);
      var servizo = datos[i][4] ? datos[i][4].toString() : "";

      // Ignorar slots "Libre"
      if (nomeCliente.toLowerCase() === "libre") continue;

      var nomeDia = NOMES_DIAS[fechaCita.getDay()];
      var dia = fechaCita.getDate();
      var mes = NOMES_MESES[fechaCita.getMonth()];

      var mensaxe = "Tes cita o " + nomeDia + " " + dia + " de " + mes + " as " + hora + "h - " + servizo;

      // Buscar o token push do cliente e enviar
      var tokenPush = obtenerTokenPushCliente(nomeCliente);
      if (tokenPush) {
        try {
          var accessToken = obterAccessTokenFCM();
          if (!accessToken) continue;

          var projectId = "app-barberia-20e9d";
          var url = "https://fcm.googleapis.com/v1/projects/" + projectId + "/messages:send";

          var payload = {
            message: {
              token: tokenPush,
              notification: {
                title: "Peluqueria Raul - Recordatorio",
                body: mensaxe
              },
              android: {
                priority: "high",
                notification: {
                  sound: "default",
                  channel_id: "default"
                }
              }
            }
          };

          UrlFetchApp.fetch(url, {
            method: "post",
            contentType: "application/json",
            headers: { "Authorization": "Bearer " + accessToken },
            payload: JSON.stringify(payload),
            muteHttpExceptions: true
          });

          Logger.log("Recordatorio enviado a: " + nomeCliente + " para o " + nomeDia + " " + dia);
        } catch (error) {
          Logger.log("Erro ao enviar recordatorio a " + nomeCliente + ": " + error.message);
        }
      }
    }
  }
}

// ============================================================
// RESPUESTA JSON
// ============================================================
function crearRespuesta(datos) {
  var salida = ContentService.createTextOutput(JSON.stringify(datos));
  salida.setMimeType(ContentService.MimeType.JSON);
  return salida;
}

// ============================================================
// NOTIFICACIÓN POR TELEGRAM AO ADMIN
// ============================================================
function enviarTelegramAdmin(texto) {
  try {
    var props = PropertiesService.getScriptProperties();
    var token = props.getProperty("TELEGRAM_BOT_TOKEN");
    var chatId = props.getProperty("TELEGRAM_ADMIN_CHAT_ID");
    if (!token || !chatId) {
      Logger.log("Telegram: faltan credenciais en Script Properties");
      return;
    }
    UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "post",
      payload: {
        chat_id: chatId,
        text: texto,
        parse_mode: "HTML",
        disable_web_page_preview: "true"
      },
      muteHttpExceptions: true
    });
  } catch (e) {
    Logger.log("Erro enviando Telegram: " + e.message);
  }
}
