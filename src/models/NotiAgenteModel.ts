// Authors:
// * Alfredo Azamar López - A01798100
// * Karla Stefania Cruz Muñiz - A01661547
// * Abner Maximiliano Lecona Nieves - A01753179

// {IMPORTS}
import { Model } from "sequelize";

// Interface for the NotiAgente model
interface NotiAgenteAttributes {
    IdNotificacion: number;
    IdEmpleado: string;
}
// Define the NotiAgente model, for the Sequelize ORM, representing a notification for an agent in the database
module.exports = (sequelize: any, DataTypes: any) => {
    class NotiAgente
        extends Model<NotiAgenteAttributes>
        implements NotiAgenteAttributes
    {
        // Attributes are enforced by the NotiAgenteAttributes interface
        public IdNotificacion!: number;
        public IdEmpleado!: string;

        // Associates the NotiAgente model with other models
        static associate(models: any) {
            NotiAgente.belongsTo(models.Notificacion, {
                foreignKey: "IdNotificacion",
                as: "Notificacion",
            });
            NotiAgente.belongsTo(models.Empleado, {
                foreignKey: "IdEmpleado",
                as: "Empleado",
            });
        }
    }
    // Initializes the NotiAgente model with its attributes and options
    NotiAgente.init(
        {
            IdNotificacion: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            IdEmpleado: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
        },
        {
            sequelize,
            modelName: "NotiAgente", // Name of the model
        }
    );
    
    return NotiAgente;
};