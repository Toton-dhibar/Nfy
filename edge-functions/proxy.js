export default async (req, context) => {
  try {
    const TARGET_HOST = 'zz.sdbuild.me';
    // HARDCODED PATH: We ignore the incoming URL path and force /autovl
    const TARGET_PATH = '/autovl'; 
    const targetUrl = `https://${TARGET_HOST}${TARGET_PATH}${new URL(req.url).search}`;

    console.log(`Force Proxying to: ${targetUrl}`);

    // Create a MINIMAL header set. 
    // Sometimes passing too many original headers (like Cloudflare or Netlify IDs) 
    // triggers security blocks on the target Nginx.
    const headers = new Headers();
    headers.set('Host', TARGET_HOST);
    headers.set('User-Agent', req.headers.get('user-agent') || 'Mozilla/5.0');
    headers.set('Accept', '*/*');
    headers.set('Connection', 'keep-alive');

    // If there's a body (POST/PUT), we must forward Content-Type
    if (req.headers.has('content-type')) {
      headers.set('content-type', req.headers.get('content-type'));
    }

    const options = {
      method: req.method,
      headers: headers,
      redirect: 'follow', // Change to follow to see if target is redirecting
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = req.body;
      options.duplex = 'half';
    }

    const response = await fetch(targetUrl, options);

    // Debugging: Log what the target server is actually telling us
    console.log(`Target Status: ${response.status}`);
    console.log(`Target Server Header: ${response.headers.get('server')}`);

    const responseHeaders = new Headers(response.headers);
    // Remove encoding to prevent browser 'compression' errors
    responseHeaders.delete('content-encoding');
    // Ensure CORS is open for your frontend
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy Failed', detail: err.message }), { 
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: "/autovl" // This ensures mynetlify.com/autovl triggers this function
};
