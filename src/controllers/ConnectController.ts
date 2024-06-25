// Authors:
// * Alfredo Azamar López - A01798100
// * José Antonio Moreno Tahuilan - A01747922

// {IMPORTS}
import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import AWS from "aws-sdk";
import {AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY} from "../config";
import { ConnectContactLensClient, ListRealtimeContactAnalysisSegmentsCommand} from "@aws-sdk/client-connect-contact-lens";

// Function to format milliseconds to minutes and seconds
function formatMillisToMinutesAndSeconds(millis: number): string {
  let minutes = Math.floor(millis / 60000);
  let seconds = Number(((millis % 60000) / 1000).toFixed(0));
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

// Define the ConnectController class
class ConnectController extends AbstractController {
  // Singleton
  // Class attribute
  private static _instance: ConnectController;
  // Class Method
  public static get instance(): ConnectController {
    if (!this._instance) {
      this._instance = new ConnectController("connect");
    }
    return this._instance;
  }

  // Define all the endpoints of the controller "ConnectController"
  protected initRoutes(): void {
    // Test route
    this.router.get("/test", this.getTest.bind(this));
    this.router.get("/sentiment/:idCall", this.authMiddleware.verifyToken, this.sendSentiment.bind(this));
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

  // Get sentiment analysis of a call
  private async sendSentiment(req: Request, res: Response) {
    const { idCall } = req.params;
    const params = {
      InstanceId:
        "arn:aws:connect:us-east-1:905418447691:instance/cbfa02b8-09e5-4774-8576-45965720fb02",
      ContactId: idCall,
    };

    const command = new ListRealtimeContactAnalysisSegmentsCommand(params);

    // Create a new ConnectContactLensClient object
    const client = new ConnectContactLensClient({ region: AWS_REGION });
    AWS.config.update({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION,
    });

    try {
      const response = await client.send(command);
      // Gets the calls transcript, sentiment, participant's role and start time
      const segments = response.Segments?.map((segment) => ({
        role: segment.Transcript?.ParticipantRole,
        content: segment.Transcript?.Content,
        sentiment: segment.Transcript?.Sentiment,
        startTime: formatMillisToMinutesAndSeconds(
          segment.Transcript?.BeginOffsetMillis || 0
        ),
      }));
      res.json(segments);
    } catch (error) {
      console.error("Error getting transcript:", error);
      res.status(500).send("Error getting transcript");
    }
  }
}

export default ConnectController;