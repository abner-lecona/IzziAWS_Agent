// Authors:
// * Alfredo Azamar López - A01798100
// * José Antonio Moreno Tahuilan - A01747922

// {IMPORTS}
import { Model } from "sequelize";

// Interface for the Notificacion model
interface NotificacionAttributes {
    IdNotificacion: number;
    FechaHora: string;
    Titulo: string;
    Descripcion: string;
}

// Define the Notificacion model, for the Sequelize ORM, representing a notification in the database
module.exports = (sequelize: any, DataTypes: any) => {
    class Notificacion
        extends Model<NotificacionAttributes>
        implements NotificacionAttributes
    {
        // Attributes are enforced by the NotificacionAttributes interface
        public IdNotificacion!: number;
        public FechaHora!: string
        public Titulo!: string;
        public Descripcion!: string;

    }

    // Initializes the Notificacion model with its attributes and options
    Notificacion.init(
        {
            IdNotificacion: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            FechaHora: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            Titulo: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Descripcion: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Notificacion", // Name of the model
        }
    );
    return Notificacion;
}