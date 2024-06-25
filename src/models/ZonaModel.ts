// Authors:
// * Alfredo Azamar López - A01798100
// * Karla Stefania Cruz Muñiz - A01661547
// * José Antonio Moreno Tahuilan - A01747922

// {IMPORTS}
import { Model } from "sequelize";

// Interface for the Zona model
interface ZonaAttributes {
  IdZona: number;
  Nombre: string;
}

// Define the Zona model, for the Sequelize ORM, representing a zone in the database
module.exports = (sequelize: any, DataTypes: any) => {
  class Zona 
    extends Model<ZonaAttributes>
    implements ZonaAttributes 
  {
    // Attributes are enforced by the ZonaAttributes interface
    public IdZona!: number;
    public Nombre!: string;
  }

  // Initializes the Zona model with its attributes and options
  Zona.init(
    {
      IdZona: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      Nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Zona", // Name of the model
    }
  );

  return Zona;
};