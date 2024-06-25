// Author: Víctor Adrián Sosa Hernández

// {IMPORTS}
import { Response, Request, NextFunction } from "express";
import { AWS_REGION, COGNITO_POOL_ID } from "../config";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";

// A dictionary to store PEMs with their corresponding KID as the key
const pems: { [key: string]: string } = {};

// Middleware for authenticating requests using JWT tokens with AWS Cognito
class AuthMiddleware {
  private poolRegion = AWS_REGION;
  private userPoolId = COGNITO_POOL_ID;

  // Singleton
  private static _instance: AuthMiddleware;
  public static get instance(): AuthMiddleware {
    return this._instance || (this._instance = new this());
  }

  private constructor() {
    this.getAWSCognitoPems();
  }

  // Middleware function to verify the JWT token in the request
  public verifyToken(req: Request, res: Response, next: NextFunction) {
    if (req.headers.authorization) {
      const token = req.headers.authorization.replace("Bearer ", "");
      const decodedJWT: any = jwt.decode(token, { complete: true });
      if (!decodedJWT) {
        return res.status(401).send({
          code: "InvalidTokenException",
          message: "The token is no valid",
        });
      }
      const kid = decodedJWT.header.kid;
      if (kid !== undefined) {
        if (Object.keys(pems).includes(kid)) {
          console.log("Verificado");
        }
        const pem = pems[kid];
        jwt.verify(token, pem, { algorithms: ["RS256"] }, function (err: any) {
          if (err) {
            return res.status(401).send({
              code: "InvalidTokenException",
              message: "The token is no valid",
            });
          }
        });
        req.user = decodedJWT.payload;
        req.token = token;
        next();
      } else {
        return res.status(401).send({
          code: "InvalidTokenException",
          message: "The token is no valid",
        });
      }
    } else {
      res.status(401).send({
        code: "NoTokenFound",
        message: "The token is not present in the request",
      });
    }
  }

  // Fetches the JSON Web Key Set (JWKS) from AWS Cognito and converts it to PEM format
  private async getAWSCognitoPems() {
    const URL = `https://cognito-idp.${this.poolRegion}.amazonaws.com/${this.userPoolId}/.well-known/jwks.json`;
    try {
      const response = await fetch(URL);
      if (!response.ok) {
        throw "COGNITO PEMS ERROR";
      }

      const data: any = await response.json();
      // "kid": "1234example=",
      // "alg": "RS256",
      // "kty": "RSA",
      // "e": "AQAB",
      // "n": "1234567890",
      // "use": "sig"

      const { keys } = data;

      keys.forEach((key: any) => {
        pems[key.kid] = jwkToPem({
          kty: key.kty,
          n: key.n,
          e: key.e,
        });
      });
      console.log(Object.keys(pems));
    } catch (error) {
      console.log("Auth Middleware getAWSCognitoPems() error", error);
    }
  }
}

export default AuthMiddleware;