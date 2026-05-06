import { createPool } from 'mariadb'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL.replace('mysql://', 'mariadb://')
const uri = connectionString + '?connectionLimit=20'
const pool = createPool(uri)

// mariadb pool configuration is usually stored internally, but we can check the initial connection config
console.log('Limit:', pool.connectionLimit)
pool.end()
