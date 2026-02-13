export default async (req, context) => {
  try {
    const TARGET_HOST = 'zz.sdbuild.me';
    const url = new URL(req.url);
    
    // Construct the absolute URL
    const targetUrl = `https://${TARGET_HOST}${url.pathname}${url.search}`;

    // 1. Create a clean set of headers
    const headers = new Headers();
    
    // 2. Manually copy only necessary headers from the original request
    const headersToCopy = ['accept', 'accept-language', 'content-type', 'authorization', 'user-agent'];
    headersToCopy.forEach(h => {
      if (req.headers.has(h)) {
        headers.set(h, req.headers.get(h));
      }
    });

    // 3. FORCE the Host header to the target
    // This is the most common reason for 404s in Nginx proxies
    headers.set('Host', TARGET_HOST);

    const options = {
      method: req.method,
      headers,
      redirect: 'manual',
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = req.body;
      options.duplex = 'half';
    }

    const response = await fetch(targetUrl, options);
    
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');

    // Add CORS headers so your browser doesn't block the response
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 502 });
  }
};

export const config = {
  path: "/*"
};
