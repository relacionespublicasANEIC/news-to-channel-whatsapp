export function GET() {
    return new Response(/*html*/`
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Article link form</title>
        </head>
        <body>
            <form action="/api/addLink">
                <input type="text" placeholder="Article link" name="link">
                <input type="submit">
            </form>
        </body>
    </html>`, { headers: new Headers({ "Content-Type": "text/html" }) });
}