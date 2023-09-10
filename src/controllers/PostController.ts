import _ from "lodash";
import { Router, Request, Response, NextFunction } from 'express';

import { BadRequestError, NotFoundError } from '../utils/requestUtils/ApiError';
import { CreatedSuccessResponse, SuccessResponse } from '../utils/requestUtils/ApiResponse';
import { Controller } from "utils/interfaces/interface";
import { createPost, updateUserPost, findOnePost, findeAllPosts, deletePost, searchPosts } from "../service/postRepo"
import { ProtectedRequest } from '../utils/interfaces/interface'


import { verifyToken } from "../middleware/auth";
import {
    validateGetall, validateIdParam, validatePost, validateSearchParam,
    validatePostUpdate, validationHandler
} from '../middleware/validator';

class PostController implements Controller {
    public path = '/posts';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.route(this.path,)
            .post(verifyToken, validatePost, validationHandler, this.create)
            .get(verifyToken, validateGetall, validationHandler, this.getAll)

        this.router.route(`${this.path}/:id`)
            .patch(verifyToken, validatePostUpdate, validationHandler, this.update)
            .get(verifyToken, validateIdParam('id'), validationHandler, this.getOne)
            .delete(verifyToken, validateIdParam('id'), validationHandler, this.delete)

        this.router.route(`${this.path}/search/:title`)
            .get(verifyToken, validateSearchParam, validationHandler, this.search)
    }

    private create = async (req: ProtectedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { title, body } = req.body;
            const data = await createPost({ title, body, user: req.user });
            return new CreatedSuccessResponse('Post successfully created.', data, 1).send(res);
        } catch (error) {
            return next(error)
        }
    }

    private getAll = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            let page = req.query.page ? Number(req.query.page) : undefined;
            let limit = req.query.limit ? Number(req.query.limit) : undefined;

            const data = await findeAllPosts({}, ['id', 'title', 'body', 'createdAt', 'updatedAt'], limit, page)
            return new SuccessResponse('Posts successfully retrieved.', data, data.length).send(res);
        } catch (error) {
            return next(error)
        }
    }

    private getOne = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const data = await findOnePost({ id: parseInt(req.params.id) })
            return new SuccessResponse('Post successfully retrieved.', data, 1).send(res);
        } catch (error) {
            return next(error)
        }
    }

    private update = async (req: ProtectedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            let update = _.pick(req.body, ['title', 'body'])
            if (Object.keys(update).length < 1) throw new BadRequestError('Invalid request body.')
            const data = await updateUserPost({ id: parseInt(req.params.id), userId: getUserId(req) }, update);
            if (!data) throw new NotFoundError('Post not found')
            return new SuccessResponse('Post successfully updated.', data, 1).send(res);
        } catch (error) {
            return next(error)
        }
    }

    private delete = async (req: ProtectedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const data = await deletePost({ id: parseInt(req.params.id), userId: getUserId(req) });
            if (!data) throw new NotFoundError('Post not found')
            return new SuccessResponse('Post was successfully deleted.', null, 0).send(res);
        } catch (error) {
            return next(error)
        }
    }

    private search = async (req: ProtectedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            let page = req.query.page ? Number(req.query.page) : undefined;
            let limit = req.query.limit ? Number(req.query.limit) : undefined;

            const data = await searchPosts(req.params.title, [], limit, page);
            return new SuccessResponse('Posts successfully retrieved.', data, data.length).send(res);
        } catch (error) {
            return next(error)
        }
    }

}

function getUserId(req: ProtectedRequest) {
    if (!req.user?.id) throw new BadRequestError()
    return req.user.id;
}

export default PostController