// Authors:
// * Alfredo Azamar López - A01798100
// * José Antonio Moreno Tahuilan - A01747922
// * Abner Maximiliano Lecona Nieves - A01753179

// {IMPORTS}
import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { Op } from "sequelize";
import moment from "moment-timezone";

// Define the LlamadaController class
class LlamadaController extends AbstractController {
  // Singleton
  // Class attribute
  private static _instance: LlamadaController;
  // Class Method
  public static get instance(): AbstractController {
    if (!this._instance) {
      this._instance = new LlamadaController("llamada");
    }
    return this._instance;
  }

  // Define all the endpoints of the controller "LlamadaController"
  protected initRoutes(): void {
    // Test route
    this.router.get("/test", this.getTest.bind(this));

    this.router.post("/crearEncuesta", this.authMiddleware.verifyToken, this.postSurvey.bind(this));
    this.router.post("/crearIncidencia", this.authMiddleware.verifyToken, this.postIncident.bind(this));
    this.router.post("/crearLlamada", this.authMiddleware.verifyToken, this.postNewCall.bind(this));
    this.router.get("/averageCallDuration", this.authMiddleware.verifyToken, this.getAverageCallDuration.bind(this));
    this.router.get("/averageCallTime/:id", this.authMiddleware.verifyToken, this.averageCallTime.bind(this));
    this.router.get("/consultarLlamadas", this.authMiddleware.verifyToken, this.getAllCalls.bind(this));
    this.router.get("/consultarSolucion/:asunto", this.authMiddleware.verifyToken, this.getSolution.bind(this));
    this.router.get("/consultarSoluciones", this.authMiddleware.verifyToken, this.getAllSolutions.bind(this));
    this.router.get("/emocionesPorDiaAgente/:id", this.authMiddleware.verifyToken, this.getEmotionPerAgent.bind(this));
    this.router.get("/infoIncidencias", this.authMiddleware.verifyToken, this.getInfoIncidents.bind(this));
    this.router.get("/infoTarjetas", this.authMiddleware.verifyToken, this.getInfoCallCards.bind(this));
    this.router.get("/llamadasArribaDelTiempo/:duracion", this.authMiddleware.verifyToken, this.getCallAboveTime.bind(this));
    this.router.get("/llamadasDeHoy", this.authMiddleware.verifyToken, this.getTodaysCalls.bind(this));
    this.router.get("/llamadasPorDia", this.authMiddleware.verifyToken, this.getCallsPerDay.bind(this));
    this.router.get("/llamadasPorHoras", this.authMiddleware.verifyToken, this.getCallsPerHour.bind(this));
    this.router.get("/negativeCallsCount", this.authMiddleware.verifyToken, this.getNegativeCallsCount.bind(this));
    this.router.get("/numPorAsunto", this.authMiddleware.verifyToken, this.getCallSubject.bind(this));
    this.router.get("/obtenerSentimiento/:IdLlamada", this.authMiddleware.verifyToken, this.getSentiment.bind(this));
    this.router.get("/tipoEmocionPorDia", this.authMiddleware.verifyToken, this.getEmotionsPerDay.bind(this));
    this.router.get("/topAgents/:num", this.authMiddleware.verifyToken, this.getTopAgents.bind(this));
    this.router.get("/topPeoresAgentes/:num", this.authMiddleware.verifyToken, this.getWorstAgents.bind(this));
    this.router.put("/cambiarSentiment", this.authMiddleware.verifyToken, this.putChangeCallSentiment.bind(this));
    this.router.put("/actualizarLlamada", this.authMiddleware.verifyToken, this.putCallDetails.bind(this));
    this.router.put("/actualizarLlamadaFinalizada", this.authMiddleware.verifyToken, this.putEndingCallDetails.bind(this));
    this.router.put("/solucionLlamada", this.authMiddleware.verifyToken, this.putCallSolution.bind(this));
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

  // Creates a new survey
  private async postSurvey(req: Request, res: Response) {
    try {
      await db.Encuesta.create(req.body);

      console.log("Encuesta creada");
      res.status(201).send("<h1>Encuesta creada</h1>");
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Retrieve updated incident information
  private async incidentInfo() {
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

  // Creates a new incident report
  private async postIncident(req: Request, res: Response) {
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

      // Insert the new incident report
      await db.sequelize.query(`
        INSERT INTO Reporte (FechaHora, Prioridad, Descripcion, FechaHora, IdZona, Celular, IdEmpleado, IdIncidencia)
        VALUES ('${subFechaHora}', '${Prioridad}', '${Descripcion}', '${subFechaHora}', '${IdZona}', '${Celular}', '${IdEmpleado}', '${IdIncidencia}');
        `);

      console.log("Reporte creado");

      // Emit socket event
      const io = req.app.get("socketio");
      if (io) {
        const incidencias = await this.incidentInfo();
        io.emit("newIncidencia", incidencias);
        console.log("Evento emitido");
      } else {
        console.log("Socket.IO no está disponible");
      }

      res.status(201).send("<h1>Incidencia creada</h1>");
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Retrieves the latest call information for each agent
  private async callDetails() {
    try {
      const llamadas = await db.sequelize.query(
        `
      SELECT
          L.Asunto, L.Sentiment, L.Notas, L.IdLlamada, L.Estado, L.FechaHora AS Fecha,
          Cliente.Nombre AS CName, Cliente.ApellidoP AS CLastName, Cliente.Celular,
          Zona.Nombre AS ZoneName, 
          Empleado.Nombre, Empleado.ApellidoP, Empleado.IdEmpleado AS IdEmpleado,
          (SELECT COUNT(*) FROM Llamada AS Llamadas WHERE Llamadas.IdEmpleado = Empleado.IdEmpleado) AS numLlamadas 
      FROM Empleado
      LEFT JOIN (
          SELECT L1.*
          FROM Llamada AS L1
          JOIN (
              SELECT IdEmpleado, MAX(FechaHora) AS MaxFechaHora
              FROM Llamada
              GROUP BY IdEmpleado
          ) AS L2 ON L1.IdEmpleado = L2.IdEmpleado AND L1.FechaHora = L2.MaxFechaHora
      ) AS L ON L.IdEmpleado = Empleado.IdEmpleado
      LEFT JOIN Cliente ON L.Celular = Cliente.Celular
      LEFT JOIN Zona ON Cliente.IdZona = Zona.IdZona
      WHERE Empleado.Rol = 'agente'
      ORDER BY Empleado.Nombre;
    `,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      return llamadas;
    } catch (err) {
      console.log(err);
      throw new Error("Internal server error" + err);
    }
  }

  // Creates a new call record
  private async postNewCall(req: Request, res: Response) {
    try {
      const {
        IdLlamada,
        Notas,
        Duracion,
        Estado,
        Sentiment,
        Asunto,
        IdEmpleado,
        Celular,
      } = req.body;
      // Get the current date and time
      const FechaHora = moment().tz("America/Mexico_City").format();
      const subFechaHora = FechaHora.substring(0, 19);

      // Insert the new call record
      await db.sequelize.query(`
        INSERT INTO Llamada (IdLlamada, FechaHora, Notas, Duracion, Estado, Sentiment, Asunto, IdEmpleado, Celular)
        VALUES ('${IdLlamada}', '${subFechaHora}', '${Notas}', '${Duracion}', '${Estado}', '${Sentiment}', '${Asunto}', '${IdEmpleado}', '${Celular}');
        `);

      console.log("Llamada creada");

      // Emit socket event
      const io = req.app.get("socketio");
      if (io) {
        // Retrieve updated call information
        const llamadas = await this.callDetails();
        io.emit("newPage", llamadas);
        console.log("Evento emitido");
      } else {
        console.log("Socket.IO no está disponible");
      }

      res.status(201).send("<h1>Llamada creada</h1>");
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Calculates the average duration of all calls
  private async getAverageCallDuration(req: Request, res: Response) {
    try {
      // Set start and end of the day for filtering calls made today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Query to calculate the average call duration
      let averageDuration = await db["Llamada"].findAll({
        attributes: [
          [
            db.Sequelize.fn(
              "AVG",
              db.Sequelize.literal(`TIME_TO_SEC(Duracion)`)
            ),
            "averageDuration",
          ],
        ],
        where: {
          FechaHora: {
            [db.Sequelize.Op.between]: [startOfDay, endOfDay],
          },
        },
      });
      res.status(200).json(averageDuration);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Calculates the average call duration for a specific employee
  private async averageCallTime(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Execute SQL query to calculate average call duration for the given employee ID
      const result = await db.sequelize.query(
        `SELECT AVG(Duracion) AS avgTime
      FROM Llamada
      WHERE IdEmpleado = :id;`,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: { id: id },
        }
      );
      res.status(200).json(result);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Retrieves all call records from the database
  private async getAllCalls(req: Request, res: Response) {
    try {
      let llamadas = await db.Llamada.findAll();
      res.status(200).json(llamadas);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Retrieves solutions related to a specific issue
  private async getSolution(req: Request, res: Response) {
    try {
      const { asunto } = req.params;

      // Fetches solutions that match the issue subject, including steps for each solution
      const soluciones = await db.SolucionBase.findAll({
        where: { Asunto: asunto },
        attributes: ["IdSolucion", "Nombre", "Asunto"],
        include: [
          {
            model: db.Pasos,
            as: "Pasos",
            attributes: ["Descripcion"],
          },
        ],
      });

      // If no solutions are found, return a 404 status code
      if (!soluciones) {
        return res.status(404).send("No se encontraron soluciones");
      }
      res.status(200).json(soluciones);
    } catch (err: any) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Retrieves all solutions
  private async getAllSolutions(req: Request, res: Response) {
    try {
      let soluciones = await db["SolucionBase"].findAll();

      if (soluciones.length == 0) {
        return res.status(404).send("No se encontraron soluciones");
      }

      res.status(200).json(soluciones);
    } catch (err: any) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Calculates and returns the sentiment analysis for calls made by a specific agent
  private async getEmotionPerAgent(req: Request, res: Response) {
    try {
      const idAgente = req.params.id;
      // Executes a query to calculate the count of positive, neutral,
      // and negative sentiments for the agent's calls.
      const emociones = await db.sequelize.query(
        `
      SELECT 
        SUM(CASE WHEN Sentiment = 'positive' THEN 1 ELSE 0 END) as Positive,
        SUM(CASE WHEN Sentiment = 'neutral' THEN 1 ELSE 0 END) as Neutral,
        SUM(CASE WHEN Sentiment = 'negative' THEN 1 ELSE 0 END) as Negative
      FROM Llamada
      WHERE IdEmpleado = :idAgente;
      `,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: { idAgente: idAgente },
        }
      );
      res.status(200).json(emociones);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Retrieves detailed information about incidents
  private async getInfoIncidents(req: Request, res: Response) {
    try {
      // Executes a query to fetch detailed information about incidents,
      // including related zones and priorities
      const incidencia = await db.sequelize.query(
        `
        SELECT *, Incidencia.Nombre as NombreIncidencia, Zona.Nombre as NombreZona, Reporte.Prioridad
        FROM Reporte
        JOIN Incidencia ON Reporte.IdIncidencia = Incidencia.IdIncidencia
        JOIN Zona ON Reporte.IdZona = Zona.IdZona
      `,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      res.status(200).json(incidencia);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Retrieves detailed information about call records for each agent
  private async getInfoCallCards(req: Request, res: Response) {
    try {
      const llamadas = await db.sequelize.query(`
      SELECT
          L.Asunto, L.Sentiment, L.Notas, L.IdLlamada, L.Estado, L.FechaHora AS Fecha,
          Cliente.Nombre AS CName, Cliente.ApellidoP AS CLastName, Cliente.Celular,
          Zona.Nombre AS ZoneName, 
          Empleado.Nombre, Empleado.ApellidoP, Empleado.IdEmpleado AS IdEmpleado,
          (SELECT COUNT(*) FROM Llamada AS Llamadas WHERE Llamadas.IdEmpleado = Empleado.IdEmpleado) AS numLlamadas 
      FROM Empleado
      LEFT JOIN (
          SELECT L1.*
          FROM Llamada AS L1
          JOIN (
              SELECT IdEmpleado, MAX(FechaHora) AS MaxFechaHora
              FROM Llamada
              GROUP BY IdEmpleado
          ) AS L2 ON L1.IdEmpleado = L2.IdEmpleado AND L1.FechaHora = L2.MaxFechaHora
      ) AS L ON L.IdEmpleado = Empleado.IdEmpleado
      LEFT JOIN Cliente ON L.Celular = Cliente.Celular
      LEFT JOIN Zona ON Cliente.IdZona = Zona.IdZona
      WHERE Empleado.Rol = 'agente'
      ORDER BY Empleado.Nombre;
      `, { type: db.sequelize.QueryTypes.SELECT });

      res.status(200).json(llamadas);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Retrieves the count of calls above and below a specified duration
  private async getCallAboveTime(req: Request, res: Response) {
    try {
      const { duracion } = req.params;

      // Executes a query to count calls above and below the specified duration
      const llamadas = await db.sequelize.query(
        `SELECT 
          SUM(CASE WHEN TIME_TO_SEC(Duracion) > ${duracion} THEN 1 ELSE 0 END) AS ArribaDelTiempo,
          SUM(CASE WHEN TIME_TO_SEC(Duracion) <= ${duracion} THEN 1 ELSE 0 END) AS AbajoDelTiempo
        FROM Llamada AS L`,
        { type: db.sequelize.QueryTypes.SELECT }
      );
      res.status(200).json(llamadas);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Gets the count of calls made today
  private async getTodaysCalls(req: Request, res: Response) {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0); // Sets the time to the start of the day.

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999); // Sets the time to the end of the day.

      // Counts calls made within the current day
      const llamadasDeHoy = await db.Llamada.count({
        where: {
          fechaHora: {
            [Op.between]: [startOfToday, endOfToday],
          },
        },
      });

      res.status(200).json({ llamadasDeHoy });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Retrieves the number of calls made per day of the current month
  public async getCallsPerDay(req: Request, res: Response) {
    try {
      // Sets the start and end of the current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date();

      // Fetches calls made within the current month
      const llamadas = await db.Llamada.findAll({
        where: {
          FechaHora: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
      });

      // Initializes an array to count calls per day of the week
      const llamadasPorDia = [0, 0, 0, 0, 0, 0, 0]; // For each day of the week

      // Increments the count for the day of the week a call was made
      llamadas.forEach((llamada: any) => {
        const dia = new Date(llamada.FechaHora).getDay();
        llamadasPorDia[dia]++;
      });

      console.log(llamadasPorDia);

      res.json(llamadasPorDia);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  // Gets the number of calls made per hour
  private async getCallsPerHour(req: Request, res: Response) {
    try {
      // Executes a query to count calls grouped by hour of the day
      const llamadas = await db.sequelize.query(
        `SELECT 
          HOUR(FechaHora) AS Hora,
          COUNT(*) AS NumeroDeLlamadas
        FROM Llamada AS L
        GROUP BY HOUR(FechaHora)
        ORDER BY Hora ASC;`,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      // Initializes an array to count calls per hour of the day
      const llamadasPorHora = new Array(24).fill(0); // For each hour of the day

      // Assigns the number of calls to the corresponding hour in the array
      llamadas.forEach((llamada: any) => {
        llamadasPorHora[parseInt(llamada.Hora) - 1] = llamada.NumeroDeLlamadas;
      });

      res.status(200).json(llamadasPorHora);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Counts the number of calls with a negative sentiment
  private async getNegativeCallsCount(req: Request, res: Response) {
    try {
      const llamadas = await db.sequelize.query(
        `
      SELECT COUNT(*) AS count
      FROM (
        SELECT 
            L.Sentiment
        FROM Empleado
        LEFT JOIN Llamada AS L ON L.IdEmpleado = Empleado.IdEmpleado AND L.FechaHora = (
                SELECT MAX(L2.FechaHora) 
                FROM Llamada AS L2 
                WHERE L2.IdEmpleado = Empleado.IdEmpleado)
        LEFT JOIN Cliente ON L.Celular = Cliente.Celular
        LEFT JOIN Zona ON Cliente.IdZona = Zona.IdZona
        LEFT JOIN Contrato ON Cliente.Celular = Contrato.Celular
        LEFT JOIN Paquete ON Contrato.IdPaquete = Paquete.IdPaquete 
        WHERE L.Sentiment = "NEGATIVE") AS subquery;
      `,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      res.status(200).json(llamadas);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Counts the occurrences of each call subject
  private async getCallSubject(req: Request, res: Response) {
    try {
      const llamadas = await db.sequelize.query(
        `SELECT Asunto, COUNT(*) as veces FROM Llamada GROUP BY Asunto ORDER BY Asunto ASC;`,
        { type: db.sequelize.QueryTypes.SELECT }
      );
      res.status(200).json(llamadas);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Retrieves the sentiment of a specific call
  private async getSentiment(req: Request, res: Response) {
    try {
      const { IdLlamada } = req.params;

      // Fetching sentiment for a specific call
      const sentimiento = await db.Llamada.findOne({
        where: { IdLlamada },
        attributes: ["Sentiment"],
      });

      if (!sentimiento) {
        return res.status(404).send("No se encontró el sentimiento");
      }

      res.status(200).json(sentimiento);
    } catch (err: any) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Counts the number of calls with each sentiment for the current day
  private async getEmotionsPerDay(req: Request, res: Response) {
    try {
      // Executes a SQL query to count calls by sentiment for today
      const emociones = await db.sequelize.query(
        `
      SELECT 
        SUM(CASE WHEN Sentiment = 'positive' THEN 1 ELSE 0 END) as Positive,
        SUM(CASE WHEN Sentiment = 'neutral' THEN 1 ELSE 0 END) as Neutral,
        SUM(CASE WHEN Sentiment = 'negative' THEN 1 ELSE 0 END) as Negative
      FROM Llamada
      WHERE DATE(FechaHora) = CURDATE();
      `,
        { type: db.sequelize.QueryTypes.SELECT }
      );
      res.status(200).json(emociones);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Retrieves the top agents based on average call rating
  private async getTopAgents(req: Request, res: Response) {
    try {
      const { num } = req.params;

      // Executes a SQL query to find top agents by average rating, limited by a parameter
      const agentes = await db.sequelize.query(
        `SELECT Nombre, ApellidoP, AVG(Calificacion) AS cali
        FROM Llamada
        JOIN Encuesta ON Llamada.IdLlamada = Encuesta.IdLlamada
        JOIN Empleado ON Llamada.IdEmpleado = Empleado.IdEmpleado
        GROUP BY Llamada.IdEmpleado
        ORDER BY Llamada.IdEmpleado DESC
        LIMIT ${num};`,
        { type: db.sequelize.QueryTypes.SELECT }
      );
      res.status(200).json(agentes);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Retrieves the agents with the lowest average call rating
  private async getWorstAgents(req: Request, res: Response) {
    try {
      const { num } = req.params;

      // Executes a SQL query to find agents with the lowest average rating, limited by a parameter
      const agentes = await db.sequelize.query(
        `SELECT Nombre, ApellidoP, AVG(Calificacion) AS cali
        FROM Llamada
        JOIN Encuesta ON Llamada.IdLlamada = Encuesta.IdLlamada
        JOIN Empleado ON Llamada.IdEmpleado = Empleado.IdEmpleado
        GROUP BY Llamada.IdEmpleado
        ORDER BY Llamada.IdEmpleado ASC
        LIMIT ${num};`,
        { type: db.sequelize.QueryTypes.SELECT }
      );
      res.status(200).json(agentes);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Updates the sentiment of a specific call and emits a socket event
  private async putChangeCallSentiment(req: Request, res: Response) {
    try {
      const { id } = req.body;
      const { sentiment } = req.body;

      // Updates the call's sentiment in the database
      const actLlamada = await db.Llamada.update(
        { Sentiment: sentiment },
        { where: { IdLlamada: id } }
      );

      // Emit socket event
      const io = req.app.get("socketio");
      if (io) {
        io.emit("sentiment", sentiment);
        console.log("Evento emitido");
      } else {
        console.log("Socket.IO no está disponible");
      }

      res.status(200).send(actLlamada);
      console.log("Sentiment actualizado");
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Updates the employee assigned to a call
  private async putCallDetails(req: Request, res: Response) {
    try {
      const { id } = req.body;
      const { IdEmpleado } = req.body;

      // Updates the call's assigned employee in the database
      await db.Llamada.update({ IdEmpleado }, { where: { IdLlamada: id } });

      // Emitir evento de socket
      const io = req.app.get("socketio"); // Web socket
      if (io) {
        // Si esta disponible
        const llamadas = await this.callDetails();
        io.emit("newPage", llamadas);
        console.log("Evento emitido");
      } else {
        // Eror
        console.log("Socket.IO no está disponible");
      }

      res.status(200).send("<h1>Llamada actualizada</h1>");
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  // Updates the duration and status of a call
  private async putEndingCallDetails(req: Request, res: Response) {
    // Cambiar la duracion y estado de la llamada
    try {
      const { id } = req.body;
      const { duracion } = req.body;
      const { estado } = req.body;

      // Updates the call's duration and status in the database
      const actLlamada = await db.Llamada.update(
        { Duracion: duracion, Estado: estado },
        { where: { IdLlamada: id } }
      );

      // Emit socket event
      const io = req.app.get("socketio");
      if (io) {
        const llamadas = await this.callDetails();
        io.emit("newPage", llamadas);
        console.log("Evento emitido");
      } else {
        console.log("Socket.IO no está disponible");
      }

      res.status(200).send(actLlamada);
      console.log("Llamada actualizada");
    } catch (err: any) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Updates the solution of a call
  private async putCallSolution(req: Request, res: Response) {
    try {
      const { IdLlamada, IdSolucion } = req.body;

      // Updates the call's solution in the database
      await db.Llamada.update(
        { IdSolucion: IdSolucion },
        { where: { IdLlamada: IdLlamada } }
      );

      res.status(200).send("Llamada actualizada con solución");
    } catch (err: any) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }
}

export default LlamadaController;
