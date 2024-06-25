// Authors:
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import { Model } from "sequelize";

// Interface for the Pasos model
interface PasosAttributes {
  IdPaso: number;
  Descripcion: string;
}

// Define the Pasos model, for the Sequelize ORM, representing a step in the database
module.exports = (sequelize: any, DataTypes: any) => {
  class Pasos 
    extends Model<PasosAttributes> 
    implements PasosAttributes 
  {
    // Attributes are enforced by the PasosAttributes interface
    public IdPaso!: number;
    public Descripcion!: string;

    // Associates the Pasos model with other models
    static associate(models: any) {
      Pasos.belongsTo(models.SolucionBase, {
        foreignKey: "IdSolucion",
        as: "Solucion",
      });
    }
  }
  
  // Initializes the Pasos model with its attributes and options
  Pasos.init(
    {
      IdPaso: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      Descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Pasos", // Name of the model
    }
  );

  return Pasos;
};
