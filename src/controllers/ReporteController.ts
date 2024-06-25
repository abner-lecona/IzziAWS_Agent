// Authors:
// * Alfredo Azamar López - A01798100
// * Abner Maximiliano Lecona Nieves - A01753179

// {IMPORTS}
import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import moment from "moment-timezone";

// Define the ReporteController class
class ReporteController extends AbstractController {
  // Singleton
  // Class attribute
  private static _instance: ReporteController;
  // Class Method
  public static get instance(): AbstractController {
    if (!this._instance) {
      this._instance = new ReporteController("reporte");
    }
    return this._instance;
  }
  // Define all the endpoints of the controller "ReporteController"
  protected initRoutes(): void {
    // Test route
    this.router.get("/test", this.getTest.bind(this));
    this.router.post("/crearReportePersonal", this.authMiddleware.verifyToken, this.postPersonalReport.bind(this)); // DOUBT
    this.router.post("/crearReporte", this.authMiddleware.verifyToken, this.postReport.bind(this));
    this.router.get("/consultarReportes", this.authMiddleware.verifyToken, this.getReports.bind(this));
    this.router.get("/consultarReportesPersonal/:phoneNum", this.authMiddleware.verifyToken, this.getPersonalReport.bind(this));
    this.router.get("/reportesCliente/:id", this.authMiddleware.verifyToken, this.getCustomerReport.bind(this));
  }

  // Test endpoint
  private getTest(req: Request, res: Response) {
    try {
      console.log("Prueba exitosa");
      res.status(200).send("<h1>Prueba exitosa</h1>");
      
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  // DOUBT
  // Creates a new personal report
  private async postPersonalReport(req: Request, res: Response) {
    try {
      console.log(req.body);
      const nuevoReporte = await db.ReportePersonal.create(req.body); //Insert

      console.log("Reporte creado");
      res.status(201).send("<h1>Reporte creado</h1>");

    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Retrieves detailed information about incidents
  private async incidentsInfo() {
    try {
      const incidencia = await db.sequelize.query(
        `
            SELECT *, Incidencia.Nombre as NombreIncidencia, Zona.Nombre as NombreZona
            FROM Reporte
            JOIN Incidencia ON Reporte.IdIncidencia = Incidencia.IdIncidencia
            JOIN Zona ON Reporte.IdZona = Zona.IdZona
          `,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      return incidencia;
    } catch (err) {
      console.log(err);
    }
  }

  // Creates a new report and emits a socket event with updated incident information
  private async postReport(req: Request, res: Response) {
    try {
      const {
        Prioridad,
        Descripcion,
        IdZona,
        Celular,
        IdEmpleado,
        IdIncidencia,
      } = req.body;
      // Get the current date and time
      const FechaHora = moment().tz("America/Mexico_City").format();
      const subFechaHora = FechaHora.substring(0, 19);

      // Insert the new report
      await db.sequelize.query(`
        INSERT INTO Reporte(FechaHora, Prioridad, Descripcion, IdZona, Celular, IdEmpleado, IdIncidencia)
        VALUES('${subFechaHora}', '${Prioridad}', '${Descripcion}', '${IdZona}', '${Celular}', '${IdEmpleado}', '${IdIncidencia}');
        `);

      console.log("Reporte creado");

      // Emit socket event
      const io = req.app.get("socketio");
      if (io) {
        const incidencias = await this.incidentsInfo();
        io.emit("newIncidencia", incidencias);
        console.log("Evento emitido");
      } else {
        console.log("Socket.IO no está disponible");
      }

      res.status(201).send("<h1>Reporte creado</h1>");

    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Retrieves all reports
  private async getReports(req: Request, res: Response) {
    try {
      let reportes = await db["Reporte"].findAll();

      res.status(200).json(reportes);

    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Handles requests for personal report consultation by phone number
  private async getPersonalReport(req: Request, res: Response) {
    try {
      const { phoneNum } = req.params;
      // Find all personal reports with the given phone number
      let reportes = await db.ReportePersonal.findAll({
        where: { Celular: phoneNum },
      });

      res.status(200).json(reportes);

    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Gets reports for a specific client by their ID
  private async getCustomerReport(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Find all reports for the given client ID
      const reportes = await db.Reporte.findAll({
        where: { Celular: id },
      });

      // Handle case where client has no reports
      if (reportes.length == 0) {
        return res.status(404).send("No tiene reportes");
      }

      res.status(200).json(reportes);

    } catch (err: any) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }
}

export default ReporteController;