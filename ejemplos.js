// CONSULTA BRUNO
// const altaOCantidadDeHoras = await Ticket.find({
//   $or: [{ prioridad: "Alta" }, { horasInvertidas: { $gt: 3 } }],
// }).select("codigo titulo prioridad horasInvertidas -_id");
// console.log(
//   "\nB) Tickets con prioridad alta o más de 3 horas:",
//   altaOCantidadDeHoras,
// );
// console.log("Total de tickets encontrados:", altaOCantidadDeHoras.length);

// CONSULTA DE ANGEL
// const bajaOConPocasHoras = await Ticket.find({
//   $or: [{ prioridad: "Baja" }, { horasInvertidas: { $lte: 2 } }],
// }).select("codigo titulo prioridad horasInvertidas -_id");
// console.log("\nB) Baja o con <= 2 horas:", bajaOConPocasHoras);
// console.log("Total de resultados B:", bajaOConPocasHoras.length);

// CONSULTA ALEXANDRA
// const ticketsActivos = await Ticket.find({
//   estado: { $in: ["Abierto", "En Progreso"] },
// }).select("codigo titulo estado prioridad -_id");
// console.log("A) Tickets abiertos o en progreso ($in):", ticketsActivos);
// console.log("Total de resultados:", ticketsActivos.length);

// const ticketsPrioritarios = await Ticket.find({
//   prioridad: { $in: ["Alta", "Crítica"] },
// }).select("codigo titulo prioridad estado -_id");
// console.log(
//   "A) Tickets con prioridad alta o crítica ($in):",
//   ticketsPrioritarios,
// );
// console.log("Total de resultados:", ticketsPrioritarios.length);
// const ticketsPrioritarios = await Ticket.find({
//   prioridad: { $in: ["Alta", "Media"] },
// }).select("codigo titulo prioridad estado -_id");
// console.log(
//   "A) Tickets con prioridad alta o crítica ($in):",
//   ticketsPrioritarios,
// );
// console.log("Total de resultados:", ticketsPrioritarios.length);

// const ticketsSinHoras = await Ticket.find({
//       horasInvertidas: { $exists: false },
//     }).select("codigo titulo prioridad estado -_id");
//     console.log(
//       "Tickets sin horas registradas ($exists: false):",
//       ticketsSinHoras,
//     );
//     console.log("Total de tickets encontrados:", ticketsSinHoras.length);

const ticketsTitulo = await Ticket.find({
  titulo: { $regex: "el", $options: "i" },
}).select("codigo titulo -_id");

console.log("\n Tickets cuyo título contiene 'el' ($regex):", ticketsTitulo);
