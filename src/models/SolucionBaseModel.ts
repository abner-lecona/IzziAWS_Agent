// Authors:
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import { Model } from "sequelize";

// Enum for the subject attribute
enum AsuntoEnum {
  Ventas = "ventas",
  Internet = "internet",
  Telefonia = "telefonia",
  Television = "television",
  Soporte = "soporte",
}

// Interface for the SolucionBase model
interface SolucionBaseAttributes {
  IdSolucion: number;
  Nombre: string;
  Asunto: AsuntoEnum;
}

// Define the SolucionBase model, for the Sequelize ORM, representing a solution in the database
module.exports = (sequelize: any, DataTypes: any) => {
  class SolucionBase
    extends Model<SolucionBaseAttributes>
    implements SolucionBaseAttributes
  {
    // Attributes are enforced by the SolucionBaseAttributes interface
    public IdSolucion!: number;
    public Nombre!: string;
    public Asunto!: AsuntoEnum;

    // Associates the SolucionBase model with other models
    static associate(models: any) {
      SolucionBase.hasMany(models.Pasos, {
        foreignKey: "IdSolucion",
        as: "Pasos",
      });
    }
  }

  // Initializes the SolucionBase model with its attributes and options
  SolucionBase.init(
    {
      IdSolucion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      Nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Asunto: {
        type: DataTypes.ENUM,
        values: Object.values(AsuntoEnum),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "SolucionBase", // Name of the model
    }
  );
  
  return SolucionBase;
};
