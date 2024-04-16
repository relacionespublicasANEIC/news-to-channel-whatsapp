import { GoogleGenerativeAI } from "@google/generative-ai";
import { kv } from "@vercel/kv";

class WhatsAppClient {
    constructor (authKey) {
        this.authKey = authKey;
    }

    async makeRequest(url, init = {}) {
        let headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": "Bearer " + this.authKey
        }

        let n = Object.assign({ headers }, init);
        let a = await fetch(url, n);
        let b = await a.json();
        return b;
    }

    async checkAlive() {
        let d = await this.makeRequest("https://gate.whapi.cloud/health?wakeup=true&channel_type=web");
        return (d.status.text === "AUTH");
    }

    async sendTextMessage(to, message) {
        let info = { to, body: message, no_link_preview: false };
        let res = await this.makeRequest("https://gate.whapi.cloud/messages/text", { method: "POST", body: JSON.stringify(info) });
        return res.sent;
    }
}

async function makeRequest(prompt) {
    const GEN_AI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const MODEL = GEN_AI.getGenerativeModel({ model: "gemini-pro" });

    let result = await MODEL.generateContent(prompt);
    return result.response.text();
};

async function getArticleLink() {
    try {
        return await kv.srandmember("links");
    } catch (e) {
        return false;
    }
}

export async function GET() {
    const article_link = await getArticleLink();
    if (!article_link) { return new Response("No more links available.", { status: 400 }) };

    let textFromAI = await Promise.all([
        makeRequest("Dame el título de este articulo " + article_link),
        makeRequest("Haz un resumen de cien palabras de este articulo: " + article_link)
    ]);

    const message = `*${textFromAI[0]}*`.concat(`\n${textFromAI[1]}`, `\nObtenido desde ${article_link}\n_ANEICBot_`);
    await kv.srem("links", article_link);

    let whatsappClient = new WhatsAppClient(process.env.WHAPI_CLOUD_API_KEY);
    let isSend = await whatsappClient.sendTextMessage(process.env.WHATSAPP_CHANNEL_ID, message);

    let totalItems = await kv.scard("links");
    if (!isSend) { return new Response("Message wasn't send.", { status: 500 }) };
    return new Response("Message send succefully. There are " + totalItems + " articles queued.");
};
