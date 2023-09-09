import { Router, Request } from 'express';

export interface UserInterface {
    id: number;
    firstname?: string;
    lastname?: string;
    password?: string
    email?: string
    createdAt?: Date;
}
export interface PostInterface {
    userId?: number;
    id: number;
    title?: string;
    body?: string;
    createdAt?: Date;
}

export interface Controller {
    path: string;
    router: Router
}

export interface ProtectedRequest extends Request {
    user?: UserInterface;
    accessToken?: string;
}