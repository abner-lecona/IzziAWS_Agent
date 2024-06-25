// Authors:
// * Alfredo Azamar López - A01798100
// * José Antonio Moreno Tahuilan - A01747922

// {IMPORTS}
import { Model } from "sequelize";

// Interface for the ReportePersonal model
interface ReportePAttributes {
  IdReporteP: string;
  FechaHora: string;
  Descripcion: string;
}

// Define the ReportePersonal model, for the Sequelize ORM, representing a personal report in the database
module.exports = (sequelize: any, DataTypes: any) => {
  class ReportePersonal
    extends Model<ReportePAttributes>
    implements ReportePAttributes
  {
    // Attributes are enforced by the ReportePAttributes interface
    public IdReporteP!: string;
    public FechaHora!: string;
    public Descripcion!: string;

    // Associates the ReportePersonal model with other models
    static associate(models: any) {
      ReportePersonal.belongsTo(models.Zona, {
        foreignKey: "IdZona",
        as: "Zona",
      });

      ReportePersonal.belongsTo(models.Cliente, {
        foreignKey: "Celular",
        as: "Cliente",
      });

      ReportePersonal.belongsTo(models.Empleado, {
        foreignKey: "IdEmpleado",
        as: "Empleado",
      });
    }
  }

  // Initializes the ReportePersonal model with its attributes and options
  ReportePersonal.init(
    {
      IdReporteP: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      FechaHora: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ReportePersonal", // Name of the model
    }
  );
  
  return ReportePersonal;
};
