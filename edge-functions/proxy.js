export default async (req, context) => {
  try {
    const TARGET_HOST = 'zz.sdbuild.me';
    const url = new URL(req.url);
    
    // Force the path to /autovl regardless of what comes in
    const targetUrl = `https://${TARGET_HOST}/autovl${url.search}`;

    // 1. Clone original headers but Filter out 'host' and 'cf/nf' headers
    const newHeaders = new Headers();
    for (const [key, value] of req.headers.entries()) {
      if (!key.startsWith('x-nf') && !key.startsWith('x-real') && key !== 'host') {
        newHeaders.set(key, value);
      }
    }

    // 2. Critical: Set Host and Origin to match the target exactly
    newHeaders.set('Host', TARGET_HOST);
    newHeaders.set('Origin', `https://${TARGET_HOST}`);
    newHeaders.set('Referer', `https://${TARGET_HOST}/`);
    
    // 3. Ensure connection is treated as a standard browser request
    newHeaders.set('Connection', 'keep-alive');

    const options = {
      method: req.method,
      headers: newHeaders,
      redirect: 'follow', // Follow internal redirects on the backend
    };

    // Handle Body for POST/PUT
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = req.body;
      options.duplex = 'half';
    }

    const response = await fetch(targetUrl, options);

    // 4. Build the response back to the user
    const responseHeaders = new Headers(response.headers);
    
    // Clean headers that cause browser mismatches
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length'); 
    
    // Fix Set-Cookie: If the backend tries to set a cookie for zz.sdbuild.me, 
    // we rewrite it for your netlify domain.
    const setCookie = responseHeaders.get('set-cookie');
    if (setCookie) {
      responseHeaders.set('set-cookie', setCookie.replace(/domain=[^;]+/g, ''));
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy Error', msg: err.message }), { status: 502 });
  }
};

export const config = {
  path: "/autovl"
};
