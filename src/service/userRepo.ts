import AppDataSource from "../data-source";
import { Users, } from "../entity/user"
import { UserInterface } from '../utils/interfaces/interface'

const UserRepository = AppDataSource.getRepository(Users);
type newUser = {
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    createdAt?: Date,
}

export async function findFieldsById(id: number, ...fields: string[]): Promise<Users | null> {
    let select: Record<string, unknown> = {};
    fields.forEach(field => {
        select[field] = true
    })
    return UserRepository.findOne({
        where: { id },
        select
    });
}

export async function findByEmail(email: string, fields?: string[]): Promise<Users | null> {
    let select: Record<string, unknown> = {};
    if (fields) {
        fields.forEach(field => {
            select[field] = true
        })
    }
    return UserRepository.findOne({
        where: { email },
        select
    });
}

export async function create(user: newUser): Promise<Users> {
    const now = new Date();
    const data = UserRepository.create(user);
    return UserRepository.save(data);
}

