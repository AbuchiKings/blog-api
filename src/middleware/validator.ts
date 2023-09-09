import { Request, Response, NextFunction } from 'express'
import { body, param, query, validationResult } from 'express-validator';

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


export const validateCreateUser = [
    body(['firstname', 'lastname'])
        .exists().withMessage('Firstname and lastname are required.')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must have a minimun of two(2) characters.')
        .escape()
        .bail()
        .matches(/^[A-Za-z]+$/)
        .withMessage('Special characters, numbers or spaces are not allowed in name fields.')
        .toLowerCase(),
    body('password')
        .exists({ checkFalsy: true, checkNull: true })
        .withMessage('Please enter your password.')
        .isLength({ min: 5, max: 100 })
        .withMessage('Password must have between 8 and 200 characters.')
        .isStrongPassword({
            minLength: 5,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1
        })
        .withMessage('Password must contain at least One Uppercase letter, a digit and at least One lowercase letter.')
        .bail(),
    body('email')
        .exists({ checkFalsy: true, checkNull: true })
        .withMessage(`Email is required`)
        .trim()
        .normalizeEmail({ all_lowercase: true })
        .isEmail()
        .withMessage('Invalid email address.')
        .isLength({ max: 100 })
        .withMessage('Email cannot have more than 60 characters.')
        .escape(),
];

export const validateLogin = [
    body('password')
        .exists({ checkFalsy: true, checkNull: true })
        .withMessage('Please enter your password.')
        .isLength({ min: 5, max: 100 })
        .withMessage('Invalid email or password.'),
    validateCreateUser[2],
];

export const validatePost = [
    body('title')
        .exists({ checkFalsy: true, checkNull: true })
        .withMessage('Title is required')
        .trim()
        .escape()
        .isLength({ min: 2, max: 100 })
        .withMessage('Title should have between 2 and 100 characters.')
        .toLowerCase()
        .escape(),
    body('body')
        .exists({ checkFalsy: true, checkNull: true })
        .withMessage('Body is required')
        .trim()
        .isLength({ min: 2, max: 1000 })
        .withMessage('Body should have between 2 and 1000 characters.')
        .escape(),
];

export const validatePostUpdate = [
    body('title')
        .optional()
        .trim()
        .escape()
        .isLength({ min: 2, max: 100 })
        .withMessage('Title should have between 2 and 100 characters.')
        .escape(),
    body('body')
        .optional()
        .trim()
        .isLength({ min: 2, max: 1000 })
        .withMessage('Body should have between 2 and 1000 characters.')
        .escape(),
];

export const validateGetall = [
    query('page')
        .optional()
        .isInt({ min: 1, max: 100000 })
        .withMessage('Page must be a whole number not less than 1'),
    query('limit')
        .optional()
        .isInt({ min: 5, max: 50 })
        .withMessage('Limit must be a whole number between 5 and 50')
];

export const validationHandler = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new UnprocessibleEntityError(errors.array()[0].msg);
    } else {
        next();
    }
};

