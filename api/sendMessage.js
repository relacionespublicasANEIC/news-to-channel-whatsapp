import { GoogleGenerativeAI } from "@google/generative-ai";
import { kv as database } from "@vercel/kv";
import { load } from "cheerio";
import WhatsAppClient from "./_WhatsappClient.js";
const { GOOGLE_GEMINI_API_KEY, WHAPI_CLOUD_API_KEY, WHATSAPP_CHANNEL_ID, DATABASE_NAME } = process.env;

async function makeRequest(prompt) {
    const GEN_AI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);
    const MODEL = GEN_AI.getGenerativeModel({ model: "gemini-pro" });

    let result = await MODEL.generateContent(prompt);
    return result.response.text();
};

async function getArticleLink() {
    try {
        return await database.srandmember(DATABASE_NAME);
    } catch (e) {
        return false;
    }
};

async function getBodyText(url) {
    let res = await fetch(url);
    let text = await res.text();

    let $ = load(text);
    $("script, style").remove();
    return $("body").text();
};

export async function GET() {
    const article_link = await getArticleLink();
    if (!article_link) { return new Response("No more links available.", { status: 400 }) };

    let bodyText = await getBodyText(article_link);
    let textFromAI = await Promise.all([
        makeRequest("Dame el título de este articulo " + bodyText),
        makeRequest("Haz un resumen de cien palabras de este articulo: " + bodyText)
    ]);

    const message = `*${textFromAI[0]}*\n${textFromAI[1]}\n\nObtenido desde ${article_link}\n_ANEICBot_`;
    await database.srem(DATABASE_NAME, article_link);

    let whatsappClient = new WhatsAppClient(WHAPI_CLOUD_API_KEY);
    let isSend = await whatsappClient.sendTextMessage(WHATSAPP_CHANNEL_ID, message);

    let totalItems = await database.scard(DATABASE_NAME);
    if (!isSend) { return new Response("Message wasn't send.", { status: 500 }) };
    return new Response("Message send succefully. There are " + totalItems + " articles queued.");
};