import { Request, Response, NextFunction } from 'express'
import { body, param, validationResult } from 'express-validator';

import { UnprocessibleEntityError } from '../utils/requestUtils/ApiError';

export const validateEmail = (email: string) => [
    body(email)
        .exists({ checkFalsy: true, checkNull: true })
        .withMessage(`${email} is required`)
        .normalizeEmail({ all_lowercase: true })
        .isEmail()
        .withMessage('Invalid email address.')
        .isLength({ max: 60 })
        .withMessage('Email cannot have more than 60 characters.'),
];

export const validateIdParam = (...ids: string[]) => {
    return param(ids)
        .exists()
        .withMessage('Onre or more Id parameters are missing.')
        .isInt({ min: 1, max: 100000000 })
        .withMessage('One or more id parameters are invalid.');
};

export const validateLogin = [
    body('password')
        .exists({ checkFalsy: true, checkNull: true })
        .withMessage('Please enter your password.')
        .isLength({ min: 8, max: 200 })
        .withMessage('Password must have between 8 and 200 characters.'),
    body('email')
        .exists({ checkFalsy: true, checkNull: true })
        .withMessage(`Email is required`)
        .normalizeEmail({ all_lowercase: true })
        .isEmail()
        .withMessage('Invalid email address.')
        .isLength({ max: 60 })
        .withMessage('Email cannot have more than 60 characters.'),
];

export const validateCreateUser = [
    body('name')
        .exists()
        .withMessage('Name is required to create a new user.')
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Name must have a minimun of two(2) characters.')
        .escape()
        .bail()
        .matches(/^[A-Za-z]+$/)
        .withMessage('Special characters, numbers or spaces are not allowed in name.')
        .toLowerCase()
];

export const validatePost = [
    body('title')
        .exists({ checkFalsy: true, checkNull: true })
        .withMessage('Title is required')
        .trim()
        .escape()
        .isLength({ min: 2, max: 100 })
        .withMessage('Title should have between 2 and 100 characters.'),
    body('body')
        .optional()
        .trim()
        .escape()
        .isLength({ min: 2, max: 100 })
        .withMessage('Body should have between 2 and 100 characters.'),
    validateIdParam('id')
];

export const validateComment = [
    body('userId')
        .exists({ checkFalsy: true, checkNull: true })
        .withMessage('User id is required')
        .isInt({ min: 1, max: 100000000 })
        .withMessage('Invalid User id.'),
    body('content')
        .optional()
        .trim()
        .escape()
        .isLength({ min: 2, max: 100 })
        .withMessage('Content should have between 2 and 100 characters.'),
    validateIdParam('postId')
];

export const validationHandler = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new UnprocessibleEntityError(errors.array()[0].msg);
    } else {
        next();
    }
};

