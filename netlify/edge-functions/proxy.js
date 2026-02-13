export default async (request, context) => {
  try {
    const TARGET_HOST = "zz.sdbuild.me"; // tumhara xray server
    const TARGET_URL = `https://${TARGET_HOST}`;

    const url = new URL(request.url);
    const targetPath = url.pathname + url.search;

    const fetchUrl = TARGET_URL + targetPath;

    // Forward headers
    const headers = new Headers(request.headers);
    headers.set("Host", TARGET_HOST);

    // Remove Netlify-specific headers
    headers.delete("x-nf-request-id");

    const response = await fetch(fetchUrl, {
      method: request.method,
      headers,
      body: request.body, // GET/HEAD ignored automatically
    });

    // Prepare response headers
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding"); // Let Netlify handle compression

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (err) {
    console.error("Proxy Error:", err);
    return new Response(JSON.stringify({
      error: "Proxy Error",
      message: err.message
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};
