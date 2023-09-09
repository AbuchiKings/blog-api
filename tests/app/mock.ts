//import UserController from "../../src/contoller/UserController";
import { JsonWebTokenError } from "jsonwebtoken";
import { JwtPayload } from "../../src/middleware/auth";
import { UserInterface } from "../../src/utils/interfaces/interface";


export const ACCESS_TOKEN = 'randomaccess';
export const accessTokenKey = 'hjdydtr';
export const USER_ID = 3;
export const USER_EMAIL = 'mytest@email.com';
const firstname = 'abuchi';
const lastname = 'kingsley';

//export const mockTestMethodSpy = jest.spyOn(new UserController(), 'test');

export const mockJwtValidate = jest.fn(
    async (token: string): Promise<JwtPayload> => {
        if (token === ACCESS_TOKEN) {
            return {
                aud: 'access',
                key: accessTokenKey,
                iss: 'issuer',
                iat: 1,
                exp: 2,
                sub: USER_ID,
                email: USER_EMAIL
            } as JwtPayload;
        }
        throw new JsonWebTokenError(`Bad Token`);
    },
);

export const mockRedisGet = jest.fn(
    async (key: string): Promise<UserInterface | undefined> => {
        if (key === `${USER_ID}:${accessTokenKey}`)
            return { id: USER_ID, email: USER_EMAIL, lastname, firstname };
        return;
    }
);

export const addHeaders = (request: any) =>
    request.set('Content-Type', 'application/json').timeout(4000);

export const addAuthHeaders = (request: any, accessToken = ACCESS_TOKEN) =>
    request
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .timeout(4000);

        