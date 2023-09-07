import crypto from "crypto";

import _ from "lodash";
import bcrypt from "bcrypt";
import { Router, Request, Response, NextFunction } from 'express';

import { AuthFailureError, BadRequestError, ConflictError } from "../utils/requestUtils/ApiError";
import { Controller } from "../utils/interfaces/interface";
import { CreatedSuccessResponse, SuccessResponse, } from '../utils/requestUtils/ApiResponse';
import { create, findByEmail, findFieldsById } from "../service/userRepo"
import { ProtectedRequest, UserInterface } from '../utils/interfaces/interface'

import { createToken, verifyToken } from "../middleware/auth";
import { rdSet, rdExp } from '../utils/cache'
import { setJson } from "../cache/query";
import { validateCreateUser, validateLogin, validationHandler } from "../middleware/validator";

class UserController implements Controller {
    public path = '/auth';
    public router = Router();

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
            const { firstname, lastname, email, password } = req.body;
            const passwordHash = await bcrypt.hash(password, 12);
            const data = await create({ firstname, lastname, email, password: passwordHash })
            new CreatedSuccessResponse('User successfully created.', data, 1).send(res);
            return;
        } catch (error: any) {
            if (error.code === '23505') {
                error = new ConflictError('User with email already exists');
            }
            next(error)
        }
    }

    private login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { email, password } = req.body;
            let user = await findByEmail(email);
            if (!user) {
                throw new AuthFailureError('Incorrect email or password.');
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) throw new AuthFailureError('Authentication failure');

            const accessTokenKey = crypto.randomBytes(30).toString('hex');
            const token = await createToken(user, accessTokenKey);
            const data = _.omit(user, ['password']);

            await setJson(`${data.id}:${accessTokenKey}`, data, 75 * 3600)
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