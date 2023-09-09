import supertest from "supertest";

import App from "../../src/app";
import UserController from "../../src/controllers/UserController";
import { UserInterface } from "../../src/utils/interfaces/interface"
import { validate } from "../../src/middleware/auth"
import { getJson } from "../../src/cache/query"

import { AuthFailureError } from "../../src/utils/requestUtils/ApiError";
import { getAccessToken, createToken } from "../../src/middleware/auth";
import {
    ACCESS_TOKEN, accessTokenKey, mockJwtValidate, addAuthHeaders,
    addHeaders,
    mockRedisGet
} from "./mock"


describe('Auth getAccessToken function', () => {
    beforeAll(() => {
        jest.clearAllMocks();
    });
    it('Should throw error when no authorization parameter is provided', () => {
        try {
            getAccessToken();
        } catch (e) {
            expect(e).toBeInstanceOf(AuthFailureError);
        }
    });

    it('Should throw error when an invalid authorization format is provided', () => {
        try {
            getAccessToken(`X- ${ACCESS_TOKEN}`);
        } catch (e: any) {
            expect(e).toBeInstanceOf(AuthFailureError);
            expect(e.message).toEqual('Invalid Authorization');
        }
    });

    it('Should return access token when valid authorization format is passed', () => {
        const accessToken = getAccessToken(`Bearer ${ACCESS_TOKEN}`);
        expect(accessToken).toEqual('randomaccess')
    });
});

describe('Auth createToken function', () => {
    beforeAll(() => {
        jest.clearAllMocks();
    });

    it('Should process an access token', async () => {
        const userId = 3

        const token = await createToken({ id: userId, email: "mytest@email.com" } as UserInterface, accessTokenKey);
        expect(token).toBeTruthy();
    });
});

describe('Auth verifyToken middleware', () => {
    const endpoint = '/api/v1/auth/test';
    // @ts-ignore
    validate = mockJwtValidate;
    // @ts-ignore
    getJson = mockRedisGet;
    const request = supertest(new App([new UserController()], 8002).express);
    beforeAll(() => {
        jest.clearAllMocks();
    });

    it('Should response with 401 if Authorization header is not passed', async () => {
        const response = await addHeaders(request.get(endpoint));
        expect(response.status).toBe(401);
    });

    it('Should response with 401 if a wrong token is sent', async () => {
        const response = await addHeaders(request.get(endpoint)).set('Authorization', 'Bearer wrongToken');
        expect(response.status).toBe(401);
        expect(mockJwtValidate).toBeCalled();
    });

    it('Should response with 200 if a correct token is sent', async () => {
        const response = await addAuthHeaders(request.get(endpoint));
        expect(response.status).toBe(200);
        expect(mockJwtValidate).toBeCalled();
        expect(mockRedisGet).toBeCalled();
    });

})