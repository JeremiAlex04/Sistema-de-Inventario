import dotenv from 'dotenv'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

dotenv.config()

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL en variables de entorno.')
}

neonConfig.webSocketConstructor = ws

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export async function query(text, params = []) {
  return pool.query(text, params)
}

export async function withTransaction(callback) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
