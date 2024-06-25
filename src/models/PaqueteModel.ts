// Authors:
// * Alfredo Azamar López - A01798100
// * Karla Stefania Cruz Muñiz - A01661547
// * José Antonio Moreno Tahuilan - A01747922

// {IMPORTS}
import { Model } from "sequelize";

// Interface for the Paquete model
interface PaqueteAttributes {
  IdPaquete: number;
  Nombre: string;
  Precio: number;
}

// Define the Paquete model, for the Sequelize ORM, representing a package in the database
module.exports = (sequelize: any, DataTypes: any) => {
  class Paquete 
    extends Model<PaqueteAttributes> 
    implements PaqueteAttributes 
  {
    // Attributes are enforced by the PaqueteAttributes interface
    public IdPaquete!: number;
    public Nombre!: string;
    public Precio!: number;
  }
  
  // Initializes the Paquete model with its attributes and options
  Paquete.init(
    {
      IdPaquete: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      Nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Precio: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Paquete", // Name of the model
    }
  );

  return Paquete;
};
