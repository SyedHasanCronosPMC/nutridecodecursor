import { pool } from '../database.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDatabase() {
  try {
    // Read and execute initial schema
    const schemaPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf-8');
    
    await pool.query(schema);
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
} 