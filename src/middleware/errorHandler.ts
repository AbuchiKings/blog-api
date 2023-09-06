import { Request, Response, NextFunction } from 'express';

import { ApiError, InternalError } from '../utils/requestUtils/ApiError';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        ApiError.handle(err, res);
    } else {
        if (process.env.node_env === 'development') {
            console.log(err) // eslint-disable-line
            return res.status(500).send(err.message);
        }
        ApiError.handle(new InternalError(), res);
    }
}

export default errorHandler;