import dotenv from 'dotenv';
import { DataSource } from "typeorm";

import { Posts } from "./entity/post"
import { Users } from "./entity/user"

dotenv.config();

let { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env;
let port = Number(DB_PORT)

const AppDataSource = new DataSource({
    type: 'postgres',
    host: DB_HOST,
    port: port,
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    entities: [Posts, Users],
    synchronize: true,
    ...(process.env.NODE_ENV === 'development' ? { logging: ["query", "error"], } : {})
})

AppDataSource.initialize().then((data) => {
    console.log(`Connected to ${data.options.database} database successfully`);
}).catch((error) => {
    console.log(DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME )
    console.log(error);
})

//AppDataSource.manager.query(``)

export default AppDataSource;