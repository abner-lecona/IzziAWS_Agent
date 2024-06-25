// Authors:
// * Alfredo Azamar López - A01798100
// * Karla Stefania Cruz Muñiz - A01661547
// * José Antonio Moreno Tahuilan - A01747922

// {IMPORTS}
import { Model } from "sequelize";

// Enum for the sentiment attribute
enum SentimentEnum{
  Inactivo = "inactivo",
  Mixed = "mixed",
  Negative = "negative",
  Neutral = "neutral",
  Positive = "positive",
}

// Enum for the subject of the call attribute
enum AsuntoEnum{
  Ventas = "ventas",
  Internet = "internet",
  Telefonia = "telefonia",
  Television = "television",
  Soporte = "soporte",
}

// Interface for the Llamada model
interface LlamadaAttributes {
  IdLlamada: string;
  FechaHora: string;
  Notas: string;
  Duracion: string;
  Estado: boolean;
  Sentiment: SentimentEnum;
  Asunto: AsuntoEnum;
}

// Define the Llamada model, for the Sequelize ORM, representing a call in the database
module.exports = (sequelize: any, DataTypes: any) => {
  class Llamada
    extends Model<LlamadaAttributes>
    implements LlamadaAttributes
  {
    // Attributes are enforced by the LlamadaAttributes interface
    public IdLlamada!: string;
    public FechaHora!: string;
    public Notas!: string;
    public Duracion!: string;
    public Estado!: boolean;
    public Sentiment!: SentimentEnum;
    public Asunto!: AsuntoEnum;

    // Associates the Llamada model with other models
    static associate(models: any) {
      Llamada.belongsTo(models.Empleado, {
        foreignKey: "IdEmpleado",
        as: "Empleado",
      });
      Llamada.belongsTo(models.Cliente, {
        foreignKey: "Celular",
        as: "Cliente",
      });
      Llamada.belongsTo(models.SolucionBase, {
        foreignKey: "IdSolucion",
        as: "Solucion",
      });
      Llamada.hasOne(models.Encuesta, {
        foreignKey: "IdLlamada",
        as: "Encuesta",
      });
    }
  }

  // Initializes the Llamada model with its attributes and options
  Llamada.init(
    {
      IdLlamada: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      FechaHora: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Notas: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Duracion: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      Estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      Sentiment: {
        type: DataTypes.ENUM,
        values: Object.values(SentimentEnum),
        allowNull: false,
        defaultValue: SentimentEnum.Inactivo,
      },
      Asunto: {
        type: DataTypes.ENUM,
        values: Object.values(AsuntoEnum),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Llamada", // Name of the model
    }
  );
  return Llamada;
};