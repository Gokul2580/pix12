const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
const onRequest = async (context) => {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
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
    const body = await request.json();
    const { data } = body;
    if (!data) {
      return new Response(JSON.stringify({ error: "No data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const publishedData = {
      ...data,
      published_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const jsonContent = JSON.stringify(publishedData, null, 2);
    const fileName = "site-data.json";
    console.log("Publishing to R2:", fileName, "Size:", jsonContent.length);
    await env.R2_BUCKET.put(fileName, jsonContent, {
      httpMetadata: {
        contentType: "application/json"
      }
    });
    console.log("Successfully published to R2");
    return new Response(
      JSON.stringify({
        success: true,
        message: "Data published successfully",
        published_at: publishedData.published_at,
        fileName
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Publish data error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Publish failed" }),
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
