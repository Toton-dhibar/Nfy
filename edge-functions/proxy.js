export default async (req, context) => {
  try {
    const TARGET_HOST = 'zz.sdbuild.me';
    const url = new URL(req.url);

    // If your Netlify URL is /autovl, this creates https://zz.sdbuild.me/autovl
    // Use 'url.pathname' directly to preserve the path exactly as it came in.
    const targetUrl = `https://${TARGET_HOST}${url.pathname}${url.search}`;

    console.log(`Proxying request to: ${targetUrl}`); // Check this in Netlify Logs

    const headers = new Headers(req.headers);
    headers.set('Host', TARGET_HOST);
    
    // Some nginx configs require the Origin header to match the Host
    if (headers.has('origin')) {
        headers.set('origin', `https://${TARGET_HOST}`);
    }

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
    
    // Create a clean response
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');

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
