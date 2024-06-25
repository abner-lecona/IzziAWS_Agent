// Authors: 
// * Víctor Adrián Sosa Hernández
// * Alfredo Azamar López - A01798100
// * José Antonio Moreno Tahuilan - A01747922

// {IMPORTS}
import Server from './provider/Server';
import {PORT,NODE_ENV} from './config';
import express from 'express';
import cors from 'cors';
import EmpleadoController from './controllers/EmpleadoController';
import ClienteController from './controllers/ClienteController';
import LlamadaController from './controllers/LlamadaController';
import ReporteController from './controllers/ReporteController';
import AuthenticationController from './controllers/AuthenticationController';
import SNSController from './controllers/SNSController';
import ConnectController from './controllers/ConnectController';
import NotificationController from './controllers/NotificacionesController';

// Creating a new Server instance with configuration options
const server = new Server({
    port:PORT,
    env:NODE_ENV,
    middlewares:[
        express.json(),
        express.urlencoded({extended:true}),
        cors()
    ],
    controllers:[
        EmpleadoController.instance,
        ClienteController.instance,
        LlamadaController.instance,
        ReporteController.instance,
        AuthenticationController.instance,
        SNSController.instance,
        ConnectController.instance,
        NotificationController.instance
    ]
});


// Extending the Express Request interface to include custom properties
declare global {
    namespace Express {
        interface Request {
            user: string;
            token: string;
        }
    }
}

// Initializing the server to start listening for requests
server.init();