import crypto from "crypto";

import _ from "lodash";
import bcrypt from "bcrypt";
import { Router, Request, Response, NextFunction } from 'express';

import { AuthFailureError, BadRequestError, ConflictError } from "../utils/requestUtils/ApiError";
import { Controller } from "../utils/interfaces/interface";
import { CreatedSuccessResponse, SuccessResponse, } from '../utils/requestUtils/ApiResponse';
import { Model } from "../service/userRepo"

import { createToken, verifyToken } from "../middleware/auth";
import { rdSet, rdExp } from '../utils/cache'
import { validateCreateUser, validateLogin, validationHandler } from "../middleware/validator";

class UserController implements Controller {
    public path = '/auth';
    public router = Router();
    private UserRepository = Model['user'];
    private LoginRepository = Model['login'];

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post(`${this.path}/signup`, validateLogin, validationHandler, this.create);

        this.router.post(`${this.path}/login`, validateLogin, validationHandler, this.login);

        this.router.get(`${this.path}/test`, verifyToken, this.test)
    }

    private create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { name } = req.body;
            const user = this.UserRepository.create({ name: name.toLowerCase() });
            const data = await this.UserRepository.save(user)
            new CreatedSuccessResponse('User successfully created.', data, 1).send(res);
            return;
        } catch (error: any) {
            if (error.code === '23505') {
                error = new ConflictError('User with name already exists');
            }
            next(error)
        }
    }

    private login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { email, password } = req.body;
            let login = await this.LoginRepository.findOne({ where: { email } });
            if (!login) {
                const passwordHash = await bcrypt.hash(password, 12);
                const user = this.LoginRepository.create({ email, password: passwordHash });
                login = await this.LoginRepository.save(user)
            } else {
                if (!login.password) throw new BadRequestError('Credential not set');

                const match = await bcrypt.compare(password, login.password);
                if (!match) throw new AuthFailureError('Authentication failure');
            }
            const accessTokenKey = crypto.randomBytes(64).toString('hex');

            const token = await createToken(login, accessTokenKey);
            const data = _.pick(login, ['id', 'email', 'createdAt']);

            await rdSet(`${login.id}:${accessTokenKey}`, JSON.stringify(data));
            await rdExp(`${login.id}:${accessTokenKey}`, 75 * 3600);
            new CreatedSuccessResponse('User successfully created.', { ...data, token }, 1).send(res);
            return;
        } catch (error) {
            next(error)
        }
    }

    public test = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            new SuccessResponse('successfully passed.', null, 0).send(res);
            return;
        } catch (error) {
            next(error)
        }
    }

}

export default UserController