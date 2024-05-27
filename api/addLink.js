import { kv as database } from "@vercel/kv";
const { DATABASE_NAME } = process.env;

function isURL(text) {
    try {
        new URL(text);
        return true
    } catch (e) {
        return false;
    }
};

export default async function handler(req, res) {
    if (!req.query.link || !isURL(req.query.link)) { return res.status(400).send("Invalid url") };
    await database.sadd(DATABASE_NAME, req.query.link);
    return res.send("A link has been added.");
};