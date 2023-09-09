import { ILike, UpdateResult, DeleteResult } from "typeorm";
import AppDataSource from "../data-source";
import { Posts } from "../entity/post"
import { PostInterface, UserInterface } from '../utils/interfaces/interface'

const PostRepository = AppDataSource.getRepository(Posts);
const QueryBuilder = AppDataSource.createQueryBuilder()

type newPost = {
    title: string,
    body: string,
    user?: UserInterface,
    createdAt?: Date,
}

type postUpdate = {
    title?: string,
    body?: string,
    updatedAt?: Date,
}

function selectFields(fields?: string[]) {
    if (!fields) return {}
    let select: Record<string, unknown> = {};
    fields.forEach(field => {
        select[field] = true
    })
    return select;
}

export async function createPost(post: newPost): Promise<Posts> {
    const data = PostRepository.create(post);
    return PostRepository.save(data);
}

export async function findOnePost(filter: Record<string, unknown>, fields?: string[]): Promise<Posts | null> {
    let select = selectFields(fields);
    return PostRepository.findOne({
        where: filter,
        select
    });
}

export async function findeAllPosts(filter?: Record<string, unknown>, fields?: string[], limit = 20, page = 1): Promise<Posts[] | []> {
    let select = selectFields(fields);
    const skip = (page - 1) * limit;
    return PostRepository.find({
        where: filter,
        select, skip, take: limit
    });
}

export async function updateUserPost(filter: Record<string, unknown>, post: postUpdate): Promise<UpdateResult> {

    let response = await QueryBuilder.update(Posts)
        .set(post).where('id = :id and "userId" = :userId', {
            ...filter
        }).returning("*").execute()
    return response?.raw[0];
}


export async function deletePost(filter: Record<string, unknown>): Promise<DeleteResult> {
    let response = await QueryBuilder.delete()
        .from(Posts)
        .returning("*").execute()
    return response.raw[0];
}


export async function searchPosts(query: string, fields?: string[], limit = 20, page = 1): Promise<Posts[] | []> {
    let select = selectFields(fields);
    const skip = (page - 1) * limit;

    return PostRepository.find({
        where: { title: ILike(`%${query}%`) },
        select, skip, take: limit
    });
}




// export async function deletePost(filter: Record<string, unknown>, post: PostInterface): Promise<unknown> {
//     return PostRepository.delete(filter)
// }

// export async function updatePost(filter: Record<string, unknown>, post: PostInterface): Promise<UpdateResult> {
//     return PostRepository.update(filter, post)
// }
// const typeReturn = async <T>(mutation: Promise<UpdateResult | DeleteResult>): Promise<T> => {
//     return (await mutation).raw[0];
// };