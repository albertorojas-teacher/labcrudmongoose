// Mongoose proporciona el cliente y los modelos de MongoDB;
// dotenv carga las variables de entorno desde el archivo env
// importar el modelo para usarlo
import mongoose from "mongoose";
import dotenv from "dotenv";
import Ticket from "./models/Tickets.js";

dotenv.config();

async function ejecutarCicloCrud() {
  try {
    console.log("Entre en el try");
    // MONGODB_URI se lee desde el archivo del entorno .env.
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado a MongoDB Atlas\n");

    // Vacia la coleccion antes de insertar los ejemplos para que cada ejecucion empiecen los mismos datos
    // Un filtro vacio ({}) coincide con todos
    // esta operacion elimina todos los tickets de una coleccion. Es util para una practica controlada
    await Ticket.deleteMany({});

    // 1.- CREATE (CREAR DOCUMENTOS)
    console.log("---1. Fase Create: Insertando Tickets Iniciales");

    // insertMany crea varios documentos en una sola operacion y devuelve los documentos creados que
    // aqui se usan para informar cuantos se crearon
    const ticketsCreados = await Ticket.insertMany([
      {
        codigo: "BUG-101",
        titulo: "Pasarela de pago lanza error 500 con tarjetas Visa",
        prioridad: "Crítica",
        estado: "Abierto",
        etiquetas: ["pagos", "backend", "produccion"],
      },
      {
        codigo: "BUG-102",
        titulo: "El botón de login se desalinea en pantallas móviles",
        prioridad: "Baja",
        estado: "En Progreso",
        agenteAsignado: "Sofía Castro",
        horasInvertidas: 2,
        etiquetas: ["ui", "css", "movil"],
      },
      {
        codigo: "BUG-103",
        titulo: "Fuga de memoria en el servidor de WebSockets",
        prioridad: "Alta",
        estado: "En Progreso",
        agenteAsignado: "Marcos Vega",
        horasInvertidas: 5,
        etiquetas: ["backend", "rendimiento", "produccion"],
      },
      {
        codigo: "BUG-104",
        titulo: "Error tipográfico en el pie de página de contacto",
        prioridad: "Baja",
        estado: "Resuelto",
        agenteAsignado: "Sofía Castro",
        horasInvertidas: 1,
        etiquetas: ["ui", "texto"],
      },
      {
        codigo: "BUG-105",
        titulo: "Lentitud al exportar reportes en PDF desde el panel",
        prioridad: "Media",
        estado: "Abierto",
        etiquetas: ["backend", "reportes"],
      },
    ]);
    console.log(`Se crearon ${ticketsCreados.length} tickets \n`);

    // 2. READ (Consultas con Operadores)
    console.log("--- 2. Fase Read: Consultas con operadores");

    // $or devuelve documentos que cumplan al menos con una condicion: prioridad critica o mas de cuatro
    // .select limita los campos de la respuesta
    // el signo delante de _id excluye ese campo
    // Los resultados se guardan en una variable que podemos inspeccionar despues.
    // find devuelve una lista, incluso cuando hay una sola coincidencia.
    const urgentesOComplejos = await Ticket.find({
      $or: [{ prioridad: "Crítica" }, { horasInvertidas: { $gt: 4 } }],
    }).select("codigo titulo prioridad horasInvertidas -_id");
    console.log("A) Criticos ó con > 4 horas ($or):", urgentesOComplejos);

    // Exists false busca documentos donde la propiedad no existe
    // No equivale necesariamente a buscar una propiedad guardada con null
    const sinAgente = await Ticket.find({
      agenteAsignado: { $exists: false },
    }).select("codigo titulo prioridad horasInvertidas -_id");
    console.log("Tickets sin agente asignado ($exists: false):", sinAgente);

    // $all exige que el array etiquetas contenga los dos valores indicados
    const backendProd = await Ticket.find({
      etiquetas: { $all: ["backend", "produccion"] },
    }).select("codigo etiquetas -_id");
    console.log("\n Tickets con tags backend y produccion ($all)", backendProd);

    const ticketsPorTitulo = await Ticket.find({
      titulo: { $regex: "Pasarela", $options: "i" },
    }).select("codigo titulo prioridad estado -_id");

    console.log(
      "Tickets cuyo titulo contiene 'Pasarela' ($regex):",
      ticketsPorTitulo,
    );

    // 3. UPDATE (ACTUALIZACION INDIVIDUAL, ATOMICA Y MASIVA)

    // findOneAndUpdate localizar un ticket y lo modificaremos en una sola opcion
    // $set reemplaza valores concretos
    // $inc incremente o suma al numero existente
    // $push añade un elemento al array
    // const ticketActualizado = await Ticket.findOneAndUpdate(
    //   { codigo: "BUG-101" },
    //   {
    //     $set: { agenteAsignado: "Bruno", estado: "En Progreso" },
    //     $inc: { horasInvertidas: 3 },
    //     $push: { etiquetas: "parche-urgente" },
    //   },
    //   { new: true, runValidators: true },
    //   // Devuelve el nuevo y ejecuta validadores del Schema
    // );
    // console.log("A) BUG-101 actualizado:", {
    //   codigo: ticketActualizado.codigo,
    //   agente: ticketActualizado.agenteAsignado,
    //   estado: ticketActualizado.estado,
    //   horas: ticketActualizado.horasInvertidas,
    //   etiquetas: ticketActualizado.etiquetas,
    // });
    // const ticketUpdate = await Ticket.findOneAndUpdate(
    //   { codigo: "BUG-103" },
    //   {
    //     $set: { prioridad: "Baja", estado: "Resuelto" },
    //     $inc: { horasInvertidas: 1 },
    //     $pull: { etiquetas: "backend" },
    //   },
    //   { returnDocument: "after", runValidators: true },
    // );
    // console.log("BUG-103 actualizado:", {
    //   prioridad: ticketUpdate.prioridad,
    //   estado: ticketUpdate.estado,
    //   horas: ticketUpdate.horasInvertidas,
    //   etiquetas: ticketUpdate.etiquetas,
    // });

    // const segundoTicketActualizado = await Ticket.findOneAndUpdate(
    //   { codigo: "BUG-102" },
    //   {
    //     $set: { agenteAsignado: "Lucía", estado: "Resuelto" },
    //     $inc: { horasInvertidas: 1 },
    //     $push: { etiquetas: "ajuste-movil" },
    //   },
    //   { new: true, runValidators: true },
    // );
    // console.log("B) BUG-102 actualizado:", {
    //   codigo: segundoTicketActualizado.codigo,
    //   agente: segundoTicketActualizado.agenteAsignado,
    //   estado: segundoTicketActualizado.estado,
    //   horas: segundoTicketActualizado.horasInvertidas,
    //   etiquetas: segundoTicketActualizado.etiquetas,
    // });
    // const ticketActualizado = await Ticket.findOneAndUpdate(
    //   { codigo: "BUG-105" },
    //   {
    //     $set: { estado: "Resuelto" },
    //     $inc: { horasInvertidas: 1.5 },
    //     $push: { etiquetas: "ui" },
    //   },
    //   { new: true, runValidators: true },
    // );

    // console.log("\nBUG-105 actualizado:", {
    //   estado: ticketActualizado.estado,
    //   horas: ticketActualizado.horasInvertidas,
    //   etiquetas: ticketActualizado.etiquetas,
    // });

    // const resultadoMasivo = await Ticket.updateMany(
    //   { agenteAsignado: { $exists: false } },
    //   { $set: { agenteAsignado: "Guardia Nivel 1" } },
    // );
    // console.log(
    //   `Actualizacion masiva completada: ${resultadoMasivo.modifiedCount} tickets asignados a Guardia Nivel 1`,
    // );

    const resultadosMasivo = await Ticket.updateMany(
      { estado: "Abierto" },
      { $set: { prioridad: "Alta" } },
    );

    console.log(
      `Actualización masiva completada: ${resultadosMasivo.modifiedCount} tickets actualizados a prioridad Alta.`,
    );
  } catch (error) {
    // Si alguna operacion falla en el try, el flujo salta hacia aqui, el error se informa
    console.error("Error en el lab:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nDesconectado de Mongo Atlas");
  }
}

ejecutarCicloCrud();
