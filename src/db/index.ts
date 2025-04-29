// Drizzle example with the Neon serverless driver
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);

const db = drizzle(sql);

export default db;
