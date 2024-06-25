// Authors:
// * Alfredo Azamar López - A01798100
// * Karla Stefania Cruz Muñiz - A01661547
// * José Antonio Moreno Tahuilan - A01747922

// {IMPORTS}
import { Model } from "sequelize";

// Interface for the Incidencia model
interface IncidenciaAttributes {
  IdIncidencia: number;
  Nombre: string;
}
// Define the Incidencia model, for the Sequelize ORM, representing an incident in the database
module.exports = (sequelize: any, DataTypes: any) => {
  class Incidencia
    extends Model<IncidenciaAttributes>
    implements IncidenciaAttributes
  {
    // Attributes are enforced by the IncidenciaAttributes interface
    public IdIncidencia!: number;
    public Nombre!: string;
  }

  // Initializes the Incidencia model with its attributes and options
  Incidencia.init(
    {
      IdIncidencia: {
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
      modelName: "Incidencia", // Name of the model
    }
  );
  
  return Incidencia;
};
