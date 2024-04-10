import { JSONFilePreset as createDatabase } from "lowdb/node";

function isURL(text) {
    try {
        new URL(text);
        return true
    } catch (e) {
        return false;
    }
};

export default async function handler(req, res) {
    if (!req.query.link || !isURL(req.query.link)) {
        return res.status(400).send("Invalid url");
    };

    const db = await createDatabase("db.json", []);
    await db.update((d) => d.push(req.query.link));
    return res.send("A link has been added.");
};