import AWS,{SecretsManager} from 'aws-sdk';
import crypto from 'node:crypto';
import { AWS_REGION, COGNITO_CLIENT_ID, COGNITO_SECRET_CLIENT } from '../config';

type CognitoAttributes='email';

class CognitoService{
    //Atributos
    private config!: AWS.CognitoIdentityServiceProvider.ClientConfiguration;
    private cognitoIdentity!: AWS.CognitoIdentityServiceProvider;
    //Conectar el backend al cognito
    private clientId:string= COGNITO_CLIENT_ID;
    private secretHash:string= COGNITO_SECRET_CLIENT;

    //Atributo de clase
    private static _instance: CognitoService;
    //Metodo de clase y Singleton
    public static get instance():CognitoService{
        return this._instance || (this._instance = new this());
    }
    //Constructor
    private constructor(){
        this.config={
            region:AWS_REGION
        };
        this.cognitoIdentity = new AWS.CognitoIdentityServiceProvider(this.config);
    }

    //Metodos de instancia

    //Registro de usuario
    public async signUpUser(email:string,password:string, userAttributes: {Name:CognitoAttributes,Value:string}[]){
        const params={
            ClientId:this.clientId,
            Password:password,
            Username:email,
            SecretHash: this.hashSecret(email),
            UserAttributes:userAttributes
        }

        try{
            return await this.cognitoIdentity.signUp(params).promise();
        }catch(err){
            console.error(err);
        }
    }
    //Autenticación
    public async signInUser(email:string,password:string){
        const params={
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: this.clientId,
            AuthParameters:{
                USERNAME:email,
                PASSWORD:password,
                SECRET_HASH:this.hashSecret(email)
            }            
        }
        
        return await this.cognitoIdentity.initiateAuth(params).promise();
    }
    //Verificación de usuarios
    public async verifyUser(email:string,code:string){
        const params={
            ClientId: this.clientId,
            ConfirmationCode: code,
            Username: email,
            SecretHash: this.hashSecret(email)
        }
        try{
            return await this.cognitoIdentity.confirmSignUp(params).promise();
        }catch(err){
            console.error(err);
        }
        
    }

    private hashSecret(username:string):string{
        return crypto
            .createHmac('SHA256',this.secretHash)
            .update(username+this.clientId)
            .digest('base64')
    }
}

export default CognitoService;