// Authors:
// * José Antonio Moreno Tahuilan - A01747922
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import AWS from "aws-sdk";
import {
  AWS_REGION,
  AWS_ACCESS_KEY_ID_C,
  AWS_SECRET_ACCESS_KEY_C,
} from "../config";

// Define the SNSController class
class SNSController extends AbstractController {
  // Singleton
  // Class attribute
  private static _instance: SNSController;
  // Class Method
  public static get instance(): SNSController {
    if (!this._instance) {
      this._instance = new SNSController("sns");
    }
    return this._instance;
  }

  // Define all the endpoints of the controller 'SNSController'
  protected initRoutes(): void {
    // Test route
    this.router.get("/test", this.getTest.bind(this));
    this.router.post("/add-phone-number", this.addPhoneNumber.bind(this));
    this.router.post("/send-message", this.authMiddleware.verifyToken, this.sendMessage.bind(this));
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

  // Add a phone number
  private async addPhoneNumber(req: Request, res: Response) {
    try {
      const { phoneNumber } = req.body;

      // Configure AWS with your credentials
      AWS.config.update({
        accessKeyId: AWS_ACCESS_KEY_ID_C,
        secretAccessKey: AWS_SECRET_ACCESS_KEY_C,
        region: AWS_REGION,
      });

      // Create a new SNS object
      const sns = new AWS.SNS();

      const params = {
        Protocol: "sms",
        TopicArn: "arn:aws:sns:us-east-1:905418447691:Incidencias",
        Endpoint: phoneNumber, // Number to subscribe
      };

      const data = await sns.subscribe(params).promise();

      console.log("Número de teléfono suscrito con éxito:", data);
      res
        .status(201)
        .json({ message: "Número de teléfono suscrito con éxito", data });

    } catch (error) {
      console.error("Error al agregar el número de teléfono:", error);
      res.status(500).json({ error: "Error al agregar el número de teléfono" });
    }
  }

  // Send a message
  private async sendMessage(req: Request, res: Response) {
    try {
      const { phoneNumber, message } = req.body;

      // Configure AWS with your credentials
      AWS.config.update({
        accessKeyId: AWS_ACCESS_KEY_ID_C,
        secretAccessKey: AWS_SECRET_ACCESS_KEY_C,
        region: AWS_REGION,
      });

      // Create a new SNS object
      const sns = new AWS.SNS();

      console.log("phoneNumber", phoneNumber);
      console.log("message", message);

      // Define the message and the phone number
      const params = {
        Message: message,
        PhoneNumber: phoneNumber,
      };

      // Send the message
      const data = await sns.publish(params).promise();

      console.log("Mensaje enviado con éxito:", data);
      res.status(201).json({ message: "Mensaje enviado con éxito" });

    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      res.status(500).json({ error: "Error al enviar el mensaje" });
    }
  }
}

export default SNSController;