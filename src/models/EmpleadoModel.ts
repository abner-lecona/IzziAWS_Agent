// Authors:
// * Alfredo Azamar López - A01798100
// * Karla Stefania Cruz Muñiz - A01661547
// * José Antonio Moreno Tahuilan - A01747922

// {IMPORTS}
import { Model } from "sequelize";

// Enum for the role attribute
enum RolEnum {
  Supervisor = "supervisor",
  Agente = "agente"
}

// Interface for the Empleado model
interface EmpleadoAttributes {
  IdEmpleado: string;
  Rol: RolEnum;
  Nombre: string;
  ApellidoP: string;
  ApellidoM: string;
  Correo: string;
}

// Define the Empleado model, for the Sequelize ORM, representing an employee in the database
module.exports = (sequelize: any, DataTypes: any) => {
  class Empleado
    extends Model<EmpleadoAttributes>
    implements EmpleadoAttributes
  {
    // Attributes are enforced by the EmpleadoAttributes interface
    public IdEmpleado!: string;
    public Rol!: RolEnum;
    public Nombre!: string;
    public ApellidoP!: string;
    public ApellidoM!: string;
    public Correo!: string;
  }

  // Initializes the Empleado model with its attributes and options
  Empleado.init(
    {
      IdEmpleado: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      Rol: {
        type: DataTypes.ENUM,
        values: Object.values(RolEnum),
        allowNull: false,
        defaultValue: RolEnum.Agente,
      },
      Nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ApellidoP: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ApellidoM: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Empleado", // Name of the model
    }
  );
  
  return Empleado;
};