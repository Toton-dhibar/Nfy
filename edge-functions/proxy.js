export default async (req, context) => {
  try {
    const TARGET_HOST = 'zz.sdbuild.me';
    const TARGET_URL = `https://${TARGET_HOST}`;

    const url = new URL(req.url);
    // Construct the new URL by appending the path and search params
    const targetUrl = TARGET_URL + url.pathname + url.search;

    const headers = new Headers(req.headers);
    
    // Crucial: Update the Host header so the target server accepts the request
    headers.set('Host', TARGET_HOST);

    // Remove headers that might cause loops or identity issues
    headers.delete('x-forwarded-for');
    headers.delete('x-nf-client-connection-ip'); // Netlify specific

    const options = {
      method: req.method,
      headers,
      redirect: 'manual', 
    };

    // Forward the body for requests that carry data
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = req.body;
      // Netlify requires duplex: 'half' for streaming request bodies
      options.duplex = 'half';
    }

    const response = await fetch(targetUrl, options);

    // Create a fresh set of headers for the response
    const responseHeaders = new Headers(response.headers);
    
    // Netlify (and most CDNs) handle compression automatically. 
    // Deleting this avoids "double compression" or encoding mismatches.
    responseHeaders.delete('content-encoding');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Proxy error', message: err.message }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Configuration to catch all paths
export const config = {
  path: "/*"
};
