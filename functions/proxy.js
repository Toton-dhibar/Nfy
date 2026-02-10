export default {
  async fetch(req, env, ctx) {
    const upgrade = req.headers.get("Upgrade");

    if (!upgrade || upgrade.toLowerCase() !== "websocket") {
      return new Response("Upgrade Required", { status: 426 });
    }

    const backendUrl = "wss://zz.sdbuild.me/wsvm";

    return fetch(backendUrl, {
      headers: req.headers
    });
  }
};

export const config = {
  path: "/ray"
};
