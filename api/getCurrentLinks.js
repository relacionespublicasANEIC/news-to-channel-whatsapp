import { kv as database } from "@vercel/kv";
const { DATABASE_NAME } = process.env;
export default async function handler(req, res) {
    return res.send(await database.smembers(DATABASE_NAME));
}