// Authors:
// * Alfredo Azamar López - A01798100
// * Karla Stefania Cruz Muñiz - A01661547
// * José Antonio Moreno Tahuilan - A01747922

// {IMPORTS}
import { Model } from "sequelize";

// Enum for the priority attribute
enum PrioridadEnum {
  Alta = "alta",
  Media = "media",
  Baja = "baja",
}

// Interface for the Reporte model
interface ReporteAttibutes {
  IdReporte: number;
  FechaHora: string;
  Prioridad: PrioridadEnum;
  Descripcion: string;
}

// Define the Reporte model, for the Sequelize ORM, representing a report in the database
module.exports = (sequelize: any, DataTypes: any) => {
  class Reporte 
    extends Model<ReporteAttibutes>
    implements ReporteAttibutes 
  {
    // Attributes are enforced by the ReporteAttibutes interface
    public IdReporte!: number;
    public FechaHora!: string;
    public Prioridad!: PrioridadEnum;
    public Descripcion!: string;

    // Associates the Reporte model with other models
    static associate(models: any) {
      Reporte.belongsTo(models.Zona, {
        foreignKey: "IdZona",
        as: "Zona",
      });
      Reporte.belongsTo(models.Cliente, {
        foreignKey: "Celular",
        as: "Cliente",
      });
      Reporte.belongsTo(models.Empleado, {
        foreignKey: "IdEmpleado",
        as: "Empleado",
      });
      Reporte.belongsTo(models.Incidencia, {
        foreignKey: "IdIncidencia",
        as: "Incidencia",
      });
    }
  }

  // Initializes the Reporte model with its attributes and options
  Reporte.init(
    {
      IdReporte: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      FechaHora: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Prioridad: {
        type: DataTypes.ENUM,
        values: Object.values(PrioridadEnum),
        allowNull: false,
        defaultValue: PrioridadEnum.Baja,
      },
      Descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Reporte", // Name of the model
    }
  );
  return Reporte;
};
