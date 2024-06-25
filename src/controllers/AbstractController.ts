// Author: Víctor Adrián Sosa Hernández

// {IMPORTS}
import {Router} from 'express';
import AuthMiddleware from '../middlewares/authorization';
import CognitoService from '../services/cognitoService';

export default abstract class AbstractController{
    private _router: Router;
    private _prefix: string;

    protected authMiddleware = AuthMiddleware.instance;
    protected cognitoService = CognitoService.instance;

    public get router(): Router{
        return this._router;
    }

    public set router(_router: Router){
        this._router = _router;
    }

    public get prefix(): string{
        return this._prefix;
    }

    protected constructor(prefix: string){
        this._router = Router();
        this._prefix = prefix;
        this.initRoutes();
    }
    // Initialize endpoints
    protected abstract initRoutes(): void;

}