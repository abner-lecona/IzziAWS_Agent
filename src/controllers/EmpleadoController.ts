// Authors:
// * Alfredo Azamar López - A01798100
// * Abner Maximiliano Lecona Nieves - A01753179
// * José Antonio Moreno Tahuilan - A01747922
// * Joahan Javier García Fernández - A01748222
// * Benjamín Alejandro Cruz Cervantes - A01747811

// {IMPORTS}
import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { Op } from "sequelize";

// Define the EmpleadoController class
class EmpleadoController extends AbstractController {
  // Singleton
  // Class attribute
  private static _instance: EmpleadoController;
  // Class Method
  public static get instance(): AbstractController {
    if (!this._instance) {
      this._instance = new EmpleadoController("empleado");
    }
    return this._instance;
  }

  // Define all the endpoints of the controller "EmpleadoController"
  protected initRoutes(): void {
    // Test route
    this.router.get("/test", this.getTest.bind(this));

    // Employee routes
    this.router.post("/crearEmpleado", this.authMiddleware.verifyToken, this.postEmployee.bind(this));
    this.router.get("/consutarEmpleado/:id", this.authMiddleware.verifyToken, this.getSpecificEmployee.bind(this));
    this.router.get("/consultarEmpleados", this.authMiddleware.verifyToken, this.getAllEmployees.bind(this));

    // Average and leaderboard routes
    this.router.get("/califPromDia/:id/calificaciones/:date", this.authMiddleware.verifyToken, this.getAvgScoreDate.bind(this));
    this.router.get("/calificacionPromedio/:id", this.authMiddleware.verifyToken, this.getAvgScore.bind(this));
    this.router.get("/consultarPromLlamadasEmpleado/:id", this.authMiddleware.verifyToken, this.getAvgCallPerEmployee.bind(this));
    this.router.get("/getCalifPromDiaAgentes/:date", this.authMiddleware.verifyToken, this.getAvgScoreEmployee.bind(this));
    this.router.get("/getPromedioTiempoLlamada/:id", this.authMiddleware.verifyToken, this.getAvgCallDuration.bind(this));
    this.router.get("/leaderboardCalificacionesDia/:date/:idEmpleado", this.authMiddleware.verifyToken, this.getLeaderboardScore.bind(this));

    // Calls and statistics routes
    this.router.post("/EMERGENCIA", this.authMiddleware.verifyToken, this.postEmergency.bind(this));
    this.router.get("/agentesActivos", this.authMiddleware.verifyToken, this.getActiveAgents.bind(this));
    this.router.get("/consultarLlamadasEmpleado/:id", this.authMiddleware.verifyToken, this.getEmployeeCalls.bind(this));
    this.router.get("/getAgenteMasLlamadasDia/:date", this.authMiddleware.verifyToken, this.getMaxCalls.bind(this));
    this.router.get("/getAgenteMejorCalifMes/:date", this.authMiddleware.verifyToken, this.getAgentBestScore.bind(this));
    this.router.get("/llamadasDiaHoyEmpleado/:id/:date",this.authMiddleware.verifyToken, this.getEmployeeCallsDate.bind(this));
    this.router.get("/leaderboardLlamadasDia/:date/:idEmpleado", this.authMiddleware.verifyToken, this.getLeaderboardCalls.bind(this));

    // Aditional stats routes
    this.router.get("/duracionPromMeses/:IdEmpleado",this.getAvgCallDurationMonth.bind(this));
    this.router.get("/modaDeSentimientoEmpleado/:id", this.getSentimentTrend.bind(this));
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

  // Function that creates an employee
  private async postEmployee(req: Request, res: Response) {
    try {
      await db.Empleado.create(req.body);
      console.log("Empleado creado");
      res.status(201).send("<h1>Empleado creado</h1>");
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Function that queries an employee for their ID
  private async getSpecificEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const empleado = await db.Empleado.findOne({
        where: { IdEmpleado: id },
      });

      if (empleado) {
        res.status(200).json(empleado);
      } else {
        res.status(404).send("El empleado no existe");
      }
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Error interno del servidor: " + error);
    }
  }

  // Function that queries the employees
  private async getAllEmployees(req: Request, res: Response) {
    try {
      let empleados = await db["Empleado"].findAll();
      res.status(200).json(empleados);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Function that calculates the average rating of an employee's calls in a day
  private async getAvgScoreDate(req: Request, res: Response) {
    try {
      const { id, date } = req.params;

      const empleado = await db.Empleado.findOne({
        where: { IdEmpleado: id },
      });

      if (!empleado) {
        return res.status(404).send("El empleado no existe");
      }

      // Converting the date to a general format
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      // Get the calls and qualifications on a specific date
      const llamadasCalif = await db.Llamada.findAll({
        where: {
          IdEmpleado: id,
          FechaHora: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: {
          model: db.Encuesta,
          as: "Encuesta",
          attributes: ["Calificacion"],
        },
      });

      if (llamadasCalif.length === 0) {
        return res
          .status(404)
          .send(
            "No se encontraron llamadas para este empleado en la fecha indicada"
          );
      }

      // Calculate grade point average
      let sumCalifs = 0;
      let totalCalifs = 0;

      for (const llamada of llamadasCalif) {
        if (llamada.Encuesta) {
          // Check if Encuesta exists for the llamada
          sumCalifs += llamada.Encuesta.Calificacion;
          totalCalifs++;
        }
      }

      const promGeneral = totalCalifs > 0 ? sumCalifs / totalCalifs : 0;
      res.status(200).json({ value: promGeneral });
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Error interno del servidor: " + error);
    }
  }

  // Function that calculates the average rating of an employee's calls
  private async getAvgScore(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if the employee exists
      const empleado = await db.Empleado.findOne({
        where: { IdEmpleado: id },
      });

      if (!empleado) {
        return res.status(404).send("El empleado no existe");
      }

      // Get the employee's calls
      const llamadasEmpleado = await db.Llamada.findAll({
        where: { IdEmpleado: id },
        attributes: ["IdLlamada"],
      });

      // Calculate the employee's call GPA
      if (llamadasEmpleado && llamadasEmpleado.length > 0) {
        let sumatoriaCalificaciones = 0;
        let totalLlamadas = 0;

        // Iterate over employee calls
        for (const llamada of llamadasEmpleado) {
          const encuestasLlamada = await db.Encuesta.findAll({
            where: { IdLlamada: llamada.IdLlamada },
            attributes: ["Calificacion"],
          });

          // Calculate the sum of grades and the total calls
          if (encuestasLlamada && encuestasLlamada.length > 0) {
            const sumCalificacionesLlamada = encuestasLlamada.reduce(
              (sum: number, encuesta: any) => sum + encuesta.Calificacion,
              0
            );
            sumatoriaCalificaciones += sumCalificacionesLlamada;
            totalLlamadas += encuestasLlamada.length;
          }
        }

        // Calculate GPA
        const promedioGeneral =
          totalLlamadas > 0 ? sumatoriaCalificaciones / totalLlamadas : 0;

        res.status(200).json({ promedioGeneral });
      } else {
        res.status(404).send("No se encontraron llamadas para este empleado");
      }
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Error interno del servidor: " + error);
    }
  }

  // Function that calculates the average call duration of an employee
  private async getAvgCallPerEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Serch for employee calls
      const llamadas = await db.Llamada.findAll({
        where: { IdEmpleado: id },
        attributes: [
          "IdEmpleado",
          // Calculate the average call duration
          [
            db.Sequelize.fn("AVG", db.Sequelize.col("Duracion")),
            "PromLlamadas",
          ],
        ],
        group: ["IdEmpleado"],
      });

      // If there are calls send response
      if (llamadas && llamadas.length > 0) {
        res.status(200).json(llamadas);
      } else {
        res.status(404).send("Empleado no encontrado");
      }
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  // Function that calculates the average rating of employee calls in a day
  private async getAvgScoreEmployee(req: Request, res: Response) {
    try {
      const { date } = req.params;

      // Converting the date to a general format
      const endDate = new Date(date);
      const startDate = new Date(date);
      startDate.setMonth(startDate.getMonth() - 1);

      // Get all calls and survey ratings in the specific date range
      const llamadasCalif = await db.Llamada.findAll({
        where: {
          FechaHora: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: db.Encuesta,
            as: "Encuesta",
            attributes: ["Calificacion"],
          },
          {
            model: db.Empleado,
            as: "Empleado",
            attributes: ["Nombre", "ApellidoP"],
          },
        ],
      });

      if (llamadasCalif.length === 0) {
        return res
          .status(404)
          .send("No se encontraron llamadas en el rango de fechas indicado");
      }

      // Calculate the grade point average for each employee per month
      const empleadoCalifs: {
        [key: string]: {
          sum: number;
          count: number;
          nombre: string;
          apellido: string;
        };
      } = {};

      for (const llamada of llamadasCalif) {
        if (llamada.Encuesta && llamada.Empleado) {
          const idEmpleado = llamada.IdEmpleado;
          const nombre = llamada.Empleado.Nombre;
          const apellido = llamada.Empleado.ApellidoP;
          if (!empleadoCalifs[idEmpleado]) {
            empleadoCalifs[idEmpleado] = { sum: 0, count: 0, nombre, apellido };
          }
          empleadoCalifs[idEmpleado].sum += llamada.Encuesta.Calificacion;
          empleadoCalifs[idEmpleado].count += 1;
        }
      }

      // Format the data for the response
      const formattedData = Object.keys(empleadoCalifs).map((idEmpleado) => {
        const { sum, count, nombre, apellido } = empleadoCalifs[idEmpleado];
        return {
          agente: `${nombre} ${apellido}`,
          value: (sum / count).toFixed(2), // Format the average to 2 decimal places
        };
      });

      res.status(200).json(formattedData);
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Error interno del servidor: " + error);
    }
  }

  // Calculate the average call time of an employee
  private async getAvgCallDuration(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await db.sequelize.query(
        `SELECT AVG(Duracion) AS avgTime
        FROM Llamada
        WHERE IdEmpleado = :id;`,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: { id: id },
        }
      );

      // Extract avgTime from the result
      const avgTime = result[0]?.avgTime;

      if (avgTime !== null && avgTime !== undefined) {
        // Convert avgTime to minutes and seconds
        const totalSeconds = Math.round(avgTime);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;

        res.status(200).json({ value: formattedTime });
      } else {
        res.status(200).json({ value: "00:00" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error: " + err);
    }
  }

  // Calculate the survey ratings leaderboard for a specific day
  private async getLeaderboardScore(req: Request, res: Response) {
    try {
      const { date, idEmpleado } = req.params;

      // Converting the date to a general format
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      // Get all calls and survey ratings on a specific date
      const llamadasCalif = await db.Llamada.findAll({
        where: {
          FechaHora: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: {
          model: db.Encuesta,
          as: "Encuesta",
          attributes: ["Calificacion"],
        },
      });

      if (llamadasCalif.length === 0) {
        return res
          .status(404)
          .send("No se encontraron llamadas en la fecha indicada");
      }

      // Calculate the grade point average for each employee
      const empleadoCalifs: { [key: string]: { sum: number; count: number } } =
        {};

      // Calculate the sum of the ratings and the number of calls for each employee
      for (const llamada of llamadasCalif) {
        if (llamada.Encuesta) {
          const idEmpleado = llamada.IdEmpleado;
          if (!empleadoCalifs[idEmpleado]) {
            empleadoCalifs[idEmpleado] = { sum: 0, count: 0 };
          }
          empleadoCalifs[idEmpleado].sum += llamada.Encuesta.Calificacion;
          empleadoCalifs[idEmpleado].count += 1;
        }
      }

      // Calculate the average rating for each employee
      const leaderboard = Object.keys(empleadoCalifs).map((idEmpleado) => {
        const { sum, count } = empleadoCalifs[idEmpleado];
        return { idEmpleado, promedio: sum / count, posicion: 0 };
      });

      // Sort the leaderboard by grade point average in descending order
      leaderboard.sort((a, b) => b.promedio - a.promedio);

      // Add the position of each employee on the leaderboard
      leaderboard.forEach((entry, index) => {
        entry.posicion = index + 1;
      });

      // Find the position of the specific employee if employeeid is provided
      if (idEmpleado) {
        const empleadoPos = leaderboard.find(
          (entry) => entry.idEmpleado === idEmpleado
        );
        if (empleadoPos) {
          return res.status(200).json({ rank: empleadoPos.posicion });
        } else {
          return res
            .status(404)
            .send("Empleado no encontrado en el leaderboard");
        }
      }

      res.status(200).json(leaderboard);
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Error interno del servidor: " + error);
    }
  }

  // Function that sends an emergency alert to the supervisor
  private async postEmergency(req: Request, res: Response) {
    try {
      const { id, nombre, apellido } = req.body;

      const io = req.app.get("socketio");

      // Emit socket event
      if (!io) {
        return res.status(500).send("Socket.io is not initialized");
      } else {
        io.emit("EMERGENCIA", { id, nombre, apellido });
        console.log("EMERGENCIA", { id, nombre, apellido });
      }
      res.status(201).send("EMERGENCIA enviada");
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  // Function that calculates the number of active and inactive calls of the agents
  private async getActiveAgents(req: Request, res: Response) {
    try {
      const llamadas = await db.sequelize.query(
        `
      SELECT 
          SUM(CASE WHEN L.Estado = 1 THEN 1 ELSE 0 END) AS Activos,
          SUM(CASE WHEN L.Estado = 0 THEN 1 ELSE 0 END) AS Inactivos
      FROM Empleado
      LEFT JOIN Llamada AS L ON L.IdEmpleado = Empleado.IdEmpleado AND L.FechaHora = (
              SELECT MAX(L2.FechaHora) 
              FROM Llamada AS L2 
              WHERE L2.IdEmpleado = Empleado.IdEmpleado)
      LEFT JOIN Cliente ON L.Celular = Cliente.Celular
      LEFT JOIN Zona ON Cliente.IdZona = Zona.IdZona
      LEFT JOIN Contrato ON Cliente.Celular = Contrato.Celular
      LEFT JOIN Paquete ON Contrato.IdPaquete = Paquete.IdPaquete
      ORDER BY Empleado.IdEmpleado;

      `,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      return res.status(200).json(llamadas);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Function that calculates the number of calls of an employee
  private async getEmployeeCalls(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Search for employee calls
      const llamadas = await db.Llamada.findAll({
        where: { IdEmpleado: id },
        // Count the number of calls
        attributes: [
          "IdEmpleado",
          [
            db.Sequelize.fn("COUNT", db.Sequelize.col("IdLlamada")),
            "NumeroLlamadas",
          ],
        ],
        // Group by employee
        group: ["IdEmpleado"],
      });

      // If there are calls...
      if (llamadas && llamadas.length > 0) {
        res.status(200).json(llamadas);
      } else {
        res.status(404).send("Empleado no encontrado");
      }
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  // Calculate the agent with the most calls on a specific day
  private async getMaxCalls(req: Request, res: Response) {
    try {
      const { date } = req.params;

      // Converting the date to a general format
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      // Get the ID of the employee with the most calls in the day
      const idEmpleadoLlamadas = await db.Llamada.findAll({
        where: {
          FechaHora: {
            [Op.between]: [startDate, endDate],
          },
        },
        attributes: [
          "IdEmpleado",
          [db.sequelize.fn("COUNT", "IdEmpleado"), "count"],
        ],
        group: ["IdEmpleado"],
        order: [[db.sequelize.literal("count"), "DESC"]],
        limit: 1,
      });

      if (idEmpleadoLlamadas.length === 0) {
        return res
          .status(404)
          .send("No se encontraron llamadas en la fecha indicada");
      }

      const idEmpleado = idEmpleadoLlamadas[0].IdEmpleado;

      // Get the first and last name of the employee with the most calls
      const empleado = await db.Empleado.findOne({
        where: { IdEmpleado: idEmpleado },
        attributes: ["Nombre", "ApellidoP"],
      });

      if (!empleado) {
        return res.status(404).send("Empleado no encontrado");
      }

      res
        .status(200)
        .json({ nombre: empleado.Nombre, apellido: empleado.ApellidoP });
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error " + error);
    }
  }

  // Calculate the agent with the best rating in the month
  private async getAgentBestScore(req: Request, res: Response) {
    try {
      const { date } = req.params;

      // Converting the date to a general format
      const endDate = new Date(date);
      const startDate = new Date(date);
      startDate.setMonth(startDate.getMonth() - 1);

      // Get all calls and survey ratings in the specific date range
      const llamadasCalif = await db.Llamada.findAll({
        where: {
          FechaHora: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: db.Encuesta,
            as: "Encuesta",
            attributes: ["Calificacion"],
          },
          {
            model: db.Empleado,
            as: "Empleado",
            attributes: ["Nombre", "ApellidoP"],
          },
        ],
      });

      if (llamadasCalif.length === 0) {
        return res
          .status(404)
          .send("No se encontraron llamadas en el rango de fechas indicado");
      }

      // Calculate the grade point average for each employee
      const empleadoCalifs: {
        [key: string]: {
          sum: number;
          count: number;
          nombre: string;
          apellido: string;
        };
      } = {};

      // Calculate the sum of the ratings and the number of calls for each employee
      for (const llamada of llamadasCalif) {
        if (llamada.Encuesta && llamada.Empleado) {
          const idEmpleado = llamada.IdEmpleado;
          const nombre = llamada.Empleado.Nombre;
          const apellido = llamada.Empleado.ApellidoP;
          if (!empleadoCalifs[idEmpleado]) {
            empleadoCalifs[idEmpleado] = { sum: 0, count: 0, nombre, apellido };
          }
          empleadoCalifs[idEmpleado].sum += llamada.Encuesta.Calificacion;
          empleadoCalifs[idEmpleado].count += 1;
        }
      }

      // Calculate the average rating for each employee
      const leaderboard = Object.keys(empleadoCalifs).map((idEmpleado) => {
        const { sum, count, nombre, apellido } = empleadoCalifs[idEmpleado];
        return { idEmpleado, promedio: sum / count, nombre, apellido };
      });

      // Sort the leaderboard by grade point average in descending order
      leaderboard.sort((a, b) => b.promedio - a.promedio);

      // Get the agent with the best rating
      const mejorAgente = leaderboard[0];

      if (!mejorAgente) {
        return res
          .status(404)
          .send("No se encontró ningún agente con calificaciones");
      }

      res
        .status(200)
        .json({ nombre: mejorAgente.nombre, apellido: mejorAgente.apellido });
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Error interno del servidor: " + error);
    }
  }

  // Function that calculates the number of calls from an employee on a specific day
  private async getEmployeeCallsDate(req: Request, res: Response) {
    try {
      const { id, date } = req.params;

      // Converting the date to a general format
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      // Get the employee's calls on the specific date
      const llamadas = await db.Llamada.findAll({
        where: {
          IdEmpleado: id,
          FechaHora: {
            [Op.between]: [startDate, endDate],
          },
        },
      });

      // Calculate the number of calls
      const numLlamadas = llamadas.length;

      res.status(200).json({ value: numLlamadas });
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error " + error);
    }
  }

  // Calculate the survey ratings leaderboard for a specific day
  private async calculateLeaderboard(nombres: any) {
    let leaderboard: { [key: string]: number } = {};

    console.log("nombres:", nombres);

    // Count the occurrences of each name
    for (let i = 0; i < nombres.length; i++) {
      const nombre = nombres[i];
      if (nombre) {
        if (leaderboard[nombre]) {
          leaderboard[nombre] += 1;
        } else {
          leaderboard[nombre] = 1;
        }
      }
    }

    console.log("leaderboard (before sorting):", leaderboard);

    // Convert the leaderboard object into an array of JSON objects ordered by the number of occurrences in descending order
    let sortedLeaderboard = Object.keys(leaderboard)
      .map((nombre) => ({
        nombre: nombre,
        llamadas: leaderboard[nombre],
      }))
      .sort((a, b) => b.llamadas - a.llamadas);

    console.log("sortedLeaderboard:", sortedLeaderboard);

    return sortedLeaderboard;
  }

  // Calculate the call leaderboard for a specific day
  private async getLeaderboardCalls(req: Request, res: Response) {
    try {
      const { date, idEmpleado } = req.params;

      // Converting the date to a general format
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      // Get all calls on a specific date
      const idEmpleadoLlamadas = await db.Llamada.findAll({
        where: {
          FechaHora: {
            [Op.between]: [startDate, endDate],
          },
        },
        attributes: ["IdEmpleado"],
      });

      // Get the employee IDs
      const idEmpleados = idEmpleadoLlamadas.map(
        (llamada: any) => llamada.IdEmpleado
      );

      const leaderboard = await this.calculateLeaderboard(idEmpleados);

      const position = leaderboard.findIndex(
        (entry: any) => entry.nombre === idEmpleado
      );

      res.status(200).json({ rank: position + 1 });
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error " + error);
    }
  }

  // Calculate the average duration of an employee's calls in the last 5 months
  private async getAvgCallDurationMonth(req: Request, res: Response) {
    try {
      const { IdEmpleado } = req.params;

      // Get the average call duration of an employee in the last 5 months
      const whereCondition: any = {
        IdEmpleado,
        FechaHora: {
          [Op.between]: [
            db.sequelize.literal("DATE_SUB(CURDATE(), INTERVAL 5 MONTH)"),
            db.sequelize.literal("CURDATE()"),
          ],
        },
      };

      const result = await db.Llamada.findAll({
        attributes: [
          [
            db.sequelize.fn("DATE_FORMAT", db.sequelize.col("FechaHora"), "%m"),
            "MonthNumber",
          ],
          [
            db.sequelize.fn("DATE_FORMAT", db.sequelize.col("FechaHora"), "%M"),
            "Month",
          ],
          [db.sequelize.fn("AVG", db.sequelize.col("Duracion")), "AvgDuration"],
        ],
        where: whereCondition,
        group: [
          "IdEmpleado",
          db.sequelize.fn(
            "DATE_FORMAT",
            db.sequelize.col("FechaHora"),
            "%Y-%m"
          ),
        ],
        order: [[db.sequelize.literal("MonthNumber"), "ASC"]],
      });

      res.json(result);
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Error interno del servidor: " + error);
    }
  }

  // Calculate the mode of an array of strings
  private async calculateMode(sentimientos: any[]) {
    let mode = 0;
    let count = 0;

    // Loop through the sentiment array
    for (let i = 0; i < sentimientos.length; i++) {
      let tempCount = 0;
      for (let j = 0; j < sentimientos.length; j++) {
        if (sentimientos[j] === sentimientos[i]) {
          tempCount++;
        }
      }
      if (tempCount > count) {
        count = tempCount;
        mode = sentimientos[i];
      }
    }
    return mode;
  }

  // Calculate the mode of the sentiments of an employee's calls
  private async getSentimentTrend(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if the employee exists
      const empleadoId = await db.Empleado.findOne({
        where: { IdEmpleado: id },
        attributes: ["IdEmpleado"],
      });

      if (!empleadoId) {
        return res.status(404).send("El empleado no existe");
      }

      // Get the employee's calls sentiments
      const llamadasEmpleado = await db.Llamada.findAll({
        where: { IdEmpleado: id },
        attributes: ["Sentiment"],
      });

      // Extract the sentiments from the calls
      const sentimientos = llamadasEmpleado.map(
        (llamada: any) => llamada.Sentiment
      );

      const moda = await this.calculateMode(sentimientos);

      res.status(200).json({ value: moda });
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error " + error);
    }
  }
}

export default EmpleadoController;
