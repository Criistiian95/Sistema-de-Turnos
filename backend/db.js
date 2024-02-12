import {createPool} from "mysql2/promise"
import {DB_NAME,DB_PASSWORD,DB_PORT,DB_USER,DB_HOST} from "./database/config"

export const pool = createPool({
    user: DB_USER,
    password:DB_PASSWORD,
    host:DB_HOST,
    port:DB_PORT,
    database:DB_NAME

})