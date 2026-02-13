export default async (req, context) => {
  const TARGET_HOST = 'zz.sdbuild.me';
  const url = new URL(req.url);

  // Hardcode the path to /autovl to ensure it hits the right backend route
  const targetUrl = `https://${TARGET_HOST}/autovl${url.search}`;

  // Clone headers and force the Host to the backend domain
  const headers = new Headers(req.headers);
  headers.set("Host", TARGET_HOST);
  headers.set("Origin", `https://${TARGET_HOST}`);
  headers.set("Referer", `https://${TARGET_HOST}/`);

  // Remove Netlify-specific headers that might confuse Nginx
  headers.delete("x-nf-client-connection-ip");
  headers.delete("x-forwarded-for");

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.body,
      redirect: "manual", // Let the browser handle any 301/302 from Nginx
    });

    // Mirror the response but strip encoding to prevent 404/compression errors
    const resHeaders = new Headers(response.headers);
    resHeaders.delete("content-encoding");
    resHeaders.set("Access-Control-Allow-Origin", "*");

    return new Response(response.body, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (err) {
    return new Response(`Edge Proxy Error: ${err.message}`, { status: 502 });
  }
};
