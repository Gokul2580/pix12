const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=60"
};
const onRequest = async (context) => {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (!env.R2_BUCKET) {
      console.error("R2_BUCKET binding not configured");
      return new Response(
        JSON.stringify({ error: "R2_BUCKET binding not configured. Please add R2 bucket binding in Cloudflare Dashboard." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    const fileName = "site-data.json";
    console.log("Fetching file:", fileName);
    const object = await env.R2_BUCKET.get(fileName);
    if (!object) {
      console.log("File not found in R2:", fileName);
      return new Response(JSON.stringify({ error: "No published data found", fallback: true }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const data = await object.text();
    console.log("Successfully fetched data, size:", data.length);
    return new Response(data, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get published data error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to get published data" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};
export {
  onRequest
};
