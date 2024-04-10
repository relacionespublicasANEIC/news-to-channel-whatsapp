export class WhatsAppClient {
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

        console.log(n);

        let a = await fetch(url, n);
        let b = await a.json();
        return b;
    }

    async checkAlive() {
        let d = await this.makeRequest("https://gate.whapi.cloud/health?wakeup=true&channel_type=web");
        return (d.status.text === "AUTH");
    }

    async sendMessage(to, message) {
        let a = { to, body: message }

        let pet = await this.makeRequest("https://gate.whapi.cloud/messages/text", {
            method: "POST", body: JSON.stringify(a),
        })

        return pet;
    }
}