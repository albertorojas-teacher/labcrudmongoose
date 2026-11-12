// Importamos mongoose para su utlizacion
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    // Identificador legible obligatorio, trim quita los espacios de los extremos
    // uppercase lo convierte en mayuscula
    // unique solicita un indice unico en mongoDB (no es un validador de mongoose)
    codigo: {
      type: String,
      required: [true, "El codigo del ticket es obligatorio"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    // Titulo obligatorio, sin espacios en blanco y longitud minima
    titulo: {
      type: String,
      required: [true, "El titulo es obligatorio"],
      trim: true,
      minlength: [5, "El titulo debe tener al menos 5 caracteres"],
    },
    // Enum restringe los valores aceptados mediante lista, default se usa cuando no se indica
    // minleng valida que si no es menor que 5 no guarde
    prioridad: {
      type: String,
      required: true,
      enum: {
        values: ["Baja", "Media", "Alta", "Crítica"],
        message: "{VALUE} no es una priridad valida",
      },
      default: "Media",
    },
    //Limitamos opciones permitidas
    // Su valor inicial es "Abierto" si quien crea el ticket no especifica otro
    estado: {
      type: String,
      required: true,
      enum: ["Abierto", "En Progreso", "Resuelto", "Cerrado"],
      default: "Abierto",
    },
    // Es opcional, porque un ticket recien creado no tiene a nadie asignado
    agenteAsignado: {
      type: String,
      trim: true,
    },
    // Si no se especifican horas, empieza en cero, min impide valores negativos
    horasInvertidas: {
      type: Number,
      default: 0,
      min: [0, "Las horas no puede ser negativas"],
    },
    // Array de texto, cada documento empieza con una lista vavia
    etiquetas: {
      type: [String],
      default: [],
    },
  },
  {
    // Mongoose añade y mantiene createdAt y updatedAt de forma automatica
    timestamps: true,
  },
);

// En servidores que recargan modulos, reutiliza el modelo ya registrado para evitar el error de intentar compilar dos veces
const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);

// Se necesita para exporta, y asi poder usarlo en la api y otras consultas que necesitemos

export default Ticket;
