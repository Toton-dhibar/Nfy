export default async (request, context) => {
  try {
    const TARGET_HOST = "zz.sdbuild.me";
    const TARGET_URL = `https://${TARGET_HOST}`;

    const url = new URL(request.url);
    const targetUrl = TARGET_URL + url.pathname + url.search;

    const headers = new Headers(request.headers);
    headers.set("Host", TARGET_HOST);

    // Remove Netlify specific headers
    headers.delete("x-nf-request-id");

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.body,
    });

    const responseHeaders = new Headers(response.headers);

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (err) {
    return new Response("Proxy Error", { status: 502 });
  }
};
