// Authors:
// * Alfredo Azamar López - A01798100
// * José Antonio Moreno Tahuilan - A01747922
// * Abner Maximiliano Lecona Nieves - A01753179

// {IMPORTS}
import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import moment from "moment-timezone";

// Define the ClienteController class
class ClienteController extends AbstractController {
  // Singleton
  // Class attribute
  private static _instance: ClienteController;
  // Class Method
  public static get instance(): AbstractController {
    if (!this._instance) {
      this._instance = new ClienteController("cliente");
    }
    return this._instance;
  }

  // Define all the endpoints of the controller "ClienteController"
  protected initRoutes(): void {
    // Test route
    this.router.get("/test", this.getTest.bind(this));

    // Client endpoints
    this.router.post("/crearCliente", this.authMiddleware.verifyToken, this.postCustomer.bind(this));
    this.router.get("/consultarCliente/:phoneNum", this.authMiddleware.verifyToken, this.getSpecificCustomerInfo.bind(this));
    this.router.get("/consultarClientes", this.authMiddleware.verifyToken, this.getCustomersInfo.bind(this));
    this.router.get("/paquetesPorCliente/:phoneNum", this.authMiddleware.verifyToken, this.getPackageCustomer.bind(this));
    this.router.get("/telefonoPorZona/:zoneName", this.authMiddleware.verifyToken, this.getPhoneByZone.bind(this));

    // Contract endpoints
    this.router.post("/crearContrato", this.authMiddleware.verifyToken, this.postCustomerContract.bind(this));
    this.router.get("/consultarContrato", this.authMiddleware.verifyToken, this.getCustomerContract.bind(this));
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


  // -------------------------------- Client endpoints --------------------------------
  // Creates a new client
  private async postCustomer(req: Request, res: Response) {
    try {
      // Insert the new client
      await db.Cliente.create(req.body);

      console.log("Cliente creado");
      res.status(201).send("<h1>Cliente creado</h1>");

    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  // Fetches a client"s details by their phone number
  private async getSpecificCustomerInfo(req: Request, res: Response) {
    try {
      const { phoneNum } = req.params;

      // Find a single client by their phone number
      const cliente = await db.Cliente.findOne({
        where: { Celular: phoneNum },
        attributes: [
          "Celular",
          "Nombre",
          "ApellidoP",
          "ApellidoM",
          "Sexo",
          "Correo",
          "FechaNac",
          "IdZona",
        ],
      });

      if (!cliente) {
        res.status(404).send("Cliente not found");
        return;
      }

      // Find the zone of the client
      const zona = await db.Zona.findOne({
        where: { IdZona: cliente.IdZona },
        attributes: ["Nombre"],
      });

      // Find all contracts for the client
      const contratos = await db.Contrato.findAll({
        where: { Celular: phoneNum },
        attributes: ["IdPaquete"],
      });

      // Find all packages for the client
      const paquetes = await db.Paquete.findAll({
        where: { IdPaquete: contratos.map((c: any) => c.IdPaquete) },
        attributes: ["Nombre"],
      });

      // Extract only the package names
      const paquetesInfo = paquetes.map((paquete: any) => ({
        Nombre: paquete.Nombre,
      }));

      // Send the response
      res.status(200).json({
        ...cliente.toJSON(),
        Zona: zona.Nombre,
        Paquetes: paquetesInfo,
      });

    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  // Retrieves all clients
  private async getCustomersInfo(req: Request, res: Response) {
    try {
      // Fetch all clients from the database
      let clientes = await db["Cliente"].findAll();

      res.status(200).json(clientes);

    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error " + err);
    }
  }

  // Retrieves packages for a given client
  private async getPackageCustomer(req: Request, res: Response) {
    try {
      const { phoneNum } = req.params;

      // Find all packages for the client
      const packages = await db.Contrato.findAll({
        include: [
          {
            model: db.Paquete,
            as: "Paquete",
            attributes: ["Nombre", "Precio"],
          },
        ],
        where: { Celular: phoneNum },
        attributes: ["Fecha"],
      });

      // Formatting the response
      const formattedResponse = packages.map(
        (coso: { Paquete: { Nombre: any; Precio: any }; Fecha: any }) => ({
          Nombre: coso.Paquete.Nombre,
          Precio: coso.Paquete.Precio,
          Fecha: coso.Fecha,
        })
      );

      res.status(200).json(formattedResponse);

    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error " + err);
    }
  }

  // Retrieves all phone numbers for a given zone
  private async getPhoneByZone(req: Request, res: Response) {
    try {
      let { zoneName } = req.params;

      // Find the zone by its name
      let zona = await db.Zona.findOne({
        where: { nombre: zoneName },
      });

      if (!zona) {
        res.status(404).send("Zona not found");
        return;
      }

      // Fetch client"s phone numbers in the specified zone
      let telefonos = await db.Cliente.findAll({
        where: { IdZona: zona.IdZona },
        attributes: ["Celular"],
      });

      res.status(200).json(telefonos);

    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error " + err);
    }
  }

// -------------------------------- Contract endpoints --------------------------------
// Creates a new contract
private async postCustomerContract(req: Request, res: Response) {
  try {
    const {Celular, IdPaquete} = req.body;
    // Get the current date and time
    const FechaHora = moment().tz("America/Mexico_City").format();
    const subFechaHora = FechaHora.substring(0, 10); 
    
    // Insert the new contract
    await db.sequelize.query(`
      INSERT INTO Contrato(Fecha, Celular, IdPaquete)
      VALUES('${subFechaHora}', '${Celular}', '${IdPaquete}');
      `);

    console.log("Contrato creado");
    res.status(201).send("<h1>Contrato creado</h1>");

  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error" + err);
  }
}

// Retrieves a new contract
private async getCustomerContract(req: Request, res: Response) {
  try {
    // Fetch all contracts from the database
    let contratos = await db["Contrato"].findAll();

    res.status(200).json(contratos);

  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error " + err);
  }
}
}

export default ClienteController;