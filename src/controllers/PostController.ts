import { Router, Request, Response, NextFunction } from 'express';

import { BadRequestError } from '../utils/requestUtils/ApiError';
import { CreatedSuccessResponse, SuccessResponse } from '../utils/requestUtils/ApiResponse';
import { Controller } from "utils/interfaces/interface";
import { Model } from "../service/repository"

import { verifyToken } from "../middleware/auth";
import { validateIdParam, validatePost, validationHandler } from '../middleware/validator';

class PostController implements Controller {
    public path = '/users/:id/posts';
    public router = Router();
    private UserRepository = Model['user'];
    private PostRepository = Model['post'];

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.route(this.path,)
            .post(verifyToken, validatePost, validationHandler, this.create)
            .get(verifyToken, validateIdParam('id'), validationHandler, this.getAll)
    }

    private create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { title, body } = req.body;
            const user = await this.UserRepository.findOne({ where: { id: +req.params.id }, select: ['id'] });
            if (!user) throw new BadRequestError('Cannot create post for non existent user.');

            const post = this.PostRepository.create({ title, body, user: user })
            const data = await this.PostRepository.save(post);
            new CreatedSuccessResponse('User successfully created.', data, 1).send(res);
            return;
        } catch (error) {
            next(error)
        }
    }

    private getAll = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const data = await this.PostRepository.find({
                // @ts-ignore
                where: {
                    user: +req.params.id
                }
            });
            new SuccessResponse('Users successfully retrieved.', data, data.length).send(res);
            return;
        } catch (error) {
            next(error)
        }
    }

}

export default PostController