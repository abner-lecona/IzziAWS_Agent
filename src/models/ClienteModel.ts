// Authors:
// * Alfredo Azamar López - A01798100
// * Karla Stefania Cruz Muñiz - A01661547
// * José Antonio Moreno Tahuilan - A01747922

// {IMPORTS}
import { Model } from "sequelize";

// Enum for the gender attribute
enum SexoEnum {
  Masculino = "masculino",
  Femenino = "femenino",
  Otro = "otro",
}

// Interface for the Cliente model
interface ClienteAttributes {
  Celular: string;
  Nombre: string;
  ApellidoP: string;
  ApellidoM: string;
  FechaNac: string;
  Sexo: SexoEnum;
  Correo: string;
}

// Define the Cliente model, for the Sequelize ORM, representing a client in the database
module.exports = (sequelize: any, DataTypes: any) => {
  class Cliente 
    extends Model<ClienteAttributes>
    implements ClienteAttributes 
  {
    // Attributes are enforced by the ClienteAttributes interface
    public Celular!: string;
    public Nombre!: string;
    public ApellidoP!: string;
    public ApellidoM!: string;
    public FechaNac!: string;
    public Sexo!: SexoEnum;
    public Correo!: string;

    // Associates the Cliente model with other models
    static associate(models: any) {
      Cliente.belongsTo(models.Zona, {
        foreignKey: "IdZona",
        as: "Zona",
      });
    }
  }

  // Initializes the Cliente model with its attributes and options
  Cliente.init(
    {
      Celular: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
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
      FechaNac: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      Sexo: {
        type: DataTypes.ENUM,
        values: Object.values(SexoEnum),
        allowNull: false,
        defaultValue: SexoEnum.Otro,
      },
      Correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Cliente", // Name of the model
    }
  );

  return Cliente;
};