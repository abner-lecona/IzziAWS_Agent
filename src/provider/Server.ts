// Author: Víctor Adrián Sosa Hernández

// {IMPORTS}
import express, {Request, Response} from 'express'; //TS
import AbstractController from '../controllers/AbstractController';
import db from '../models';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import * as socketIo from 'socket.io';

/**
 * The Server class encapsulates the setup and management of an express application,
 * its middleware, routes, database connection, and real-time communication via Socket.IO.
 */
class Server{
    // Class attribute
    private app: express.Application;
    private port: number;
    private env:string;
    private server:any;
    private io:any;
    
    // Class Method
    constructor(appInit:{port:number;env:string;middlewares:any[];controllers:AbstractController[]}){
        this.app = express();
        this.port = appInit.port;
        this.env = appInit.env;
        this.loadmiddlewares(appInit.middlewares);
        this.loadRoutes(appInit.controllers);
        this.connectDB();
        
        this.app.use(cors());

        this.server = createServer(this.app);
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: "*",
            },
        });
        this.app.set('socketio', this.io);
        this.setupSocketIO();
        
    }

    // Loads routes from the provided controllers into the express application
    private loadRoutes(controllers:AbstractController[]):void{
        this.app.get('/',(req:Request,res:Response)=>{
            res.status(200).send('Hello world');
        })
        
        controllers.forEach((controller:AbstractController )=> {
            this.app.use(`/${controller.prefix}`,controller.router);
        })
    }

    private loadmiddlewares(middlewares:any[]):void{
        middlewares.forEach((middleware:any)=>{
            this.app.use(middleware);
        })
    }

    // Loads middleware into the express application
    private async connectDB(){
        await db.sequelize.sync({force:false});
    }

    // Connects to the database
    public init(){
        this.server.listen(this.port,()=>{
            console.log(`Server running on port ${this.port}`);
        })       
    }

    // Sets up Socket.IO event listeners for handling client connections and disconnections
    private setupSocketIO() {
        this.io.on('connection', (socket: socketIo.Socket) => {
            console.log('A user connected');
            socket.on('disconnect', () => {
                console.log('User disconnected');
            });
        });
    }

}

export default Server;