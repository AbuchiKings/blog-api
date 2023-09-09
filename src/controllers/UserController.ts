import crypto from "crypto";

import _ from "lodash";
import bcrypt from "bcrypt";
import { Router, Request, Response, NextFunction } from 'express';

import { AuthFailureError, ConflictError } from "../utils/requestUtils/ApiError";
import { Controller } from "../utils/interfaces/interface";
import { CreatedSuccessResponse, SuccessResponse, } from '../utils/requestUtils/ApiResponse';
import { create, findByEmail, findFieldsById } from "../service/userRepo"

import { createToken, verifyToken } from "../middleware/auth";
import { setJson } from "../cache/query";
import { validateCreateUser, validateLogin, validationHandler } from "../middleware/validator";
import { Users } from "entity/user";

class UserController implements Controller {
    public path = '/auth';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post(`${this.path}/signup`, validateCreateUser, validationHandler, this.create);

        this.router.post(`${this.path}/login`, validateLogin, validationHandler, this.login);

        this.router.get(`${this.path}/test`, verifyToken, this.test)
    }

    private create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            let { firstname, lastname, email, password } = req.body;
            const passwordHash = await bcrypt.hash(password, 12);
            lastname = lastname.toLowerCase();
            firstname = firstname.toLowerCase();
            const data = await create({ firstname, lastname, email, password: passwordHash })
            const result = getUserData(data);
            return new CreatedSuccessResponse('User successfully created.', result, 1).send(res);
        } catch (error: any) {
            if (error.code === '23505') {
                error = new ConflictError('User with email already exists');
            }
            return next(error)
        }
    }

    private login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { email, password } = req.body;
            let user = await findByEmail(email, ['password', 'firstname', 'createdAt', 'id', 'email', 'lastname']);
            if (!user) {
                throw new AuthFailureError('Incorrect email or password.');
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) throw new AuthFailureError('Authentication failure');

            const accessTokenKey = crypto.randomBytes(20).toString('hex');
            const token = await createToken(user, accessTokenKey);
            const data = getUserData(user);

            await setJson(`${data.id}:${accessTokenKey}`, data, 75 * 3600)
            return new SuccessResponse('User successfully logged in.', { ...data, token }, 1).send(res);
        } catch (error) {
            return next(error)
        }
    }

    public test = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            new SuccessResponse('successfully passed.', null, 0).send(res);
            return;
        } catch (error) {
            return next(error)
        }
    }

}

function getUserData(user: Users) {
    const data = _.omit(user, ['password']);
    console.log(data)
    return data;
}
export default UserController