export default async (req, context) => {
  const upgrade = req.headers.get("Upgrade") || "";

  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Upgrade Required", { status: 426 });
  }

  // URL de tu backend real con V2Ray
  const backendUrl = "wss://zz.sdbuild.me/wsvm";

  return context.rewrite(backendUrl);
};

export const config = {
  path: "/ray"
};
