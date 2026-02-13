export default async (req, context) => {
  const TARGET_URL = 'https://zz.sdbuild.me/autovl';

  return new Response(null, {
    status: 302,
    headers: {
      "Location": TARGET_URL,
      "Cache-Control": "no-cache"
    }
  });
};

export const config = {
  path: "/autovl"
};
