export default async (request, context) => {
  const url = new URL(request.url);
  const targetUrl = "https://zz.sdbuild.me:443" + url.pathname + url.search;

  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body
  });

  // Clona todas las cabeceras originales
  const headers = new Headers(backendResponse.headers);
  // Sólo añade controles de caché
  headers.set("Cache-Control", "no-store");
  headers.set("Netlify-CDN-Cache-Control", "no-store");

  // Devuelve la respuesta original + cabeceras extras
  return new Response(await backendResponse.arrayBuffer(), {
    status: backendResponse.status,
    headers
  });
};

export const config = {
  path: "/autovl1*"
};
