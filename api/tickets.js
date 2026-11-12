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
      const { prioridad, estado, buscar, sinAsignar } = req.query;
      const filtro = {};

      // Este if es un ejemplo de un if de una sola instrucion
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
  } catch (error) {}
}
