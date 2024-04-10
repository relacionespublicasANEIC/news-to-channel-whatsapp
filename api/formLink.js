export async function GET() { 
    return new Response(/*html*/`
    <form action="/api/addLink">
        <input type="text" placeholder="Article link" name="link">
        <input type="submit">
    </form>`, { headers: new Headers({ "Content-Type": "text/html" }) });
}