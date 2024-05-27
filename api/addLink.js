import { kv as database } from "@vercel/kv";
const { DATABASE_NAME, INTERNAL_PASSWORD } = process.env;

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
    if (!req.query.password || req.query.password !== INTERNAL_PASSWORD) { return res.status(400).send("The password is incorrect") };
    await database.sadd(DATABASE_NAME, req.query.link);
    return res.send("A link has been added.");
};