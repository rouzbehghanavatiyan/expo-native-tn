export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const url = "https://fcm.googleapis.com/v1/projects/clashtalent-e5471/messages:send";

    try {
      const body = await request.text();

      const headers = new Headers();
      headers.set('Authorization', request.headers.get('Authorization'));
      headers.set('Content-Type', 'application/json');

      const fcmResponse = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body
      });

      const data = await fcmResponse.text();

      return new Response(data, {
        status: fcmResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
  }
};
