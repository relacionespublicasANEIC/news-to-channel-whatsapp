import { GoogleGenerativeAI } from "@google/generative-ai";
import { JSONFilePreset as createDatabase } from "lowdb/node";

async function makeRequest(prompt) {
    const GEN_AI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const MODEL = GEN_AI.getGenerativeModel({ model: "gemini-pro" });

    let result = await MODEL.generateContent(prompt);
    return result.response.text();
};

export async function GET() {
    const db = await createDatabase("db.json", []);
    const article_link = db.data[0];

    if (!article_link) { return new Response("No more links available.") };

    let textFromAI = await Promise.all([
        makeRequest("Dame el título de este articulo " + article_link),
        makeRequest("Haz un resumen de cien palabras de este articulo: " + article_link)
    ]);

    const message = `*${textFromAI[0]}*`.concat(`\n${textFromAI[1]}`, `\nObtenido desde ${article_link}\n_ANEICBot_`);
    await db.update((data) => data.pop());
    
    return new Response(message);
    // let b = await checkWhatsAppAlive();

    // let wh = new WhatsAppClient("");
    // console.log(await wh.sendMessage("", a));

};