// Importamos mongoose y el modelo
import mongoose from "mongoose";
import Ticket from "../models/Tickets.js";

export default async function handler(req, res) {
  try {
    // readystate ===0 significa desconectado; await espera a que la conexion termine antes de intentar consultar
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // El metodo HTTP indica que operacion del CRUD solicitamos
    const { method } = req;

    // 1. GET

    // req.query contiene los parametros de la URL

    if (method === "GET") {
      const { codigo, prioridad, estado, buscar, sinAsignar } = req.query;
      const filtro = {};

      // Este if es un ejemplo de un if de una sola instrucion
      if (codigo) filtro.codigo = codigo;
      if (prioridad) filtro.prioridad = prioridad;
      if (estado) filtro.estado = estado;
      if (buscar) {
        // regex busca el texto dentro del titulo
        // "i" ignora diferencias entre minusculas y mayusculas
        filtro.titulo = { $regex: buscar, $options: "i" };
      }

      if (sinAsignar === "true") {
        // Los parametros en la url llegan como texto, Se compara con "true"
        // $exists: false traerse todos los documentos sin ese campo asignado
        filtro.agenteAsignado = { $exists: false };
      }

      //   sort ({createdAt: -1 }) ordena de mas reciente a mas antiguo
      // Se devuelve el total de documentos encontrados
      const tickets = await Ticket.find(filtro).sort({ createdAt: -1 });
      return res.status(200).json({ total: tickets.length, datos: tickets });
    }

    // 2.- POST
    if (method === "POST") {
      // req.body contiene los datos enviados por nosotros o cliente(normalmente en JSON)
      // create valida y guarda el nuevo documento
      const nuevoTicket = await Ticket.create(req.body);
      return res.status(201).json({
        mensaje: "Ticket nuevo creado con exito",
        ticket: nuevoTicket,
      });
    }

    // 3.- PATCH (UPDATE): Actualizar estado, agente o sumar horas por codigo (?codigo=BUG-101)
    if (method === "PATCH") {
      // PATCH modifica parte del recurso, a diferencia de reemplazarlo completo (put)
      // El identificador se recibe mediante la url y los cambios los hacemos por el body
      const { codigo } = req.query;
      const { estado, agenteAsignado, sumarHoras, nuevaEtiqueta } = req.body;

      // Sin codigo no se puede saber que ticket acutalizar, osea valida

      if (!codigo) {
        return res
          .status(400)
          .json({ error: "Debes indicar el codigo ?codigo=BUG-XXX en la url" });
      }

      // Los operadores de actulizacion expresan que cambios hacer sin sustituir el documento entero: $set
      // ya que el set asigna campos
      const actualizacion = { $set: {} };

      // En algunos if, omitimos las llaves porque controla una unica asignacion
      if (estado) actualizacion.$set.estado = estado;
      if (agenteAsignado) actualizacion.$set.agenteAsignado = agenteAsignado;
      // sumarHoras llega desde el cuerpo de la peticion, Number lo convierte en numero
      // usamos $inc para incrementar el valor en la base de datos
      if (sumarHoras)
        actualizacion.$inc = { horasInvertidas: Number(sumarHoras) };

      // push añade un elemento al final del array
      if (nuevaEtiqueta) actualizacion.$push = { etiquetas: nuevaEtiqueta };

      const ticketModificado = await Ticket.findOneAndUpdate(
        { codigo: codigo.toUpperCase() },
        actualizacion,
        // new devuelve el documento acutlizado, runValidators vuelve a aplivar las validaciones del Shema
        { new: true, runValidators: true },
      );
      if (!ticketModificado) {
        return res.status(400).json({ error: "Ticket no encontrado" });
      }

      return res.status(200).json({
        mensaje: "Ticket actualizado con exito",
        ticket: ticketModificado,
      });
    }

    return res.status(405).json({ error: `Metodo ${method} no permitido` });
  } catch (error) {}
}
