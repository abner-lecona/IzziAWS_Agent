// Authors:
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import { Model } from "sequelize";

// Enum for the question attribute
enum PreguntaEnum {
  Pregunta1 = "1",
  Pregunta2 = "2",
  Pregunta3 = "3",
}

// Interface for the Encuesta model
interface EncuestaAttributes {
  IdEncuesta: number;
  Pregunta: PreguntaEnum;
  Calificacion: number;
}

// Define the Encuesta model, for the Sequelize ORM, representing a survey in the database
module.exports = (sequelize: any, DataTypes: any) => {
  class Encuesta
    extends Model<EncuestaAttributes>
    implements EncuestaAttributes
  {
    // Attributes are enforced by the EncuestaAttributes interface
    public IdEncuesta!: number;
    public Pregunta!: PreguntaEnum;
    public Calificacion!: number;

    // Associates the Encuesta model with other models
    static associate(models: any) {
      Encuesta.belongsTo(models.Llamada, {
        foreignKey: "IdLlamada",
        as: "Llamada",
      });
    }
  }

  // Initializes the Encuesta model with its attributes and options
  Encuesta.init(
    {
      IdEncuesta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      Pregunta: {
        type: DataTypes.ENUM,
        values: Object.values(PreguntaEnum),
        allowNull: false,
      },
      Calificacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Encuesta", // Name of the model
    }
  );
  
  return Encuesta;
};