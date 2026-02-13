try {
  const TARGET_HOST = "zz.sdbuild.me";
  const TARGET_URL = `https://${TARGET_HOST}`;

  const url = new URL(req.url);
  const targetUrl = TARGET_URL + url.pathname + url.search;

  const headers = new Headers(req.headers);
  headers.set("Host", TARGET_HOST);

  headers.delete("cf-connecting-ip");
  headers.delete("cf-ipcountry");
  headers.delete("cf-ray");
  headers.delete("x-forwarded-for");

  const options = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    options.body = req.body;
  }

  const response = await fetch(targetUrl, options);

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });

} catch (err) {
  return new Response(
    JSON.stringify({ error: "Proxy error", message: err.message }),
    { status: 502, headers: { "Content-Type": "application/json" } }
  );
    }
