// Authors:
// * Alfredo Azamar López - A01798100
// * Karla Stefania Cruz Muñiz - A01661547
// * José Antonio Moreno Tahuilan - A01747922

// {IMPORTS}
import { Model } from "sequelize";

// Interface for the Contrato model
interface ContratoAttributes {
  IdContrato: number;
  Fecha: string;
}

// Define the Contrato model, for the Sequelize ORM, representing a contract in the database
module.exports = (sequelize: any, DataTypes: any) => {
  class Contrato
    extends Model<ContratoAttributes>
    implements ContratoAttributes
  {
    // Attributes are enforced by the ContratoAttributes interface
    public IdContrato!: number;
    public Fecha!: string;

    // Associates the Contrato model with other models
    static associate(models: any) {
      Contrato.belongsTo(models.Cliente, {
        foreignKey: "Celular",
        as: "Cliente",
      });
      Contrato.belongsTo(models.Paquete, {
        foreignKey: "IdPaquete",
        as: "Paquete",
      });
    }
  }

  // Initializes the Contrato model with its attributes and options
  Contrato.init(
    {
      IdContrato: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      Fecha: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Contrato", // Name of the model
    }
  );

  return Contrato;
};