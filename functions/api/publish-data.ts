import type { RequestContext } from '@cloudflare/workers-types';

interface Env {
  R2_BUCKET: R2Bucket;
}

interface PublishDataPayload {
  data: Record<string, any>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Validate and sanitize data before publishing
function validateData(data: Record<string, any>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for required keys
  const requiredKeys = ['products', 'categories'];
  requiredKeys.forEach(key => {
    if (data[key] === undefined) {
      errors.push(`Missing required field: ${key}`);
    }
  });

  // Validate products structure
  if (data.products && typeof data.products === 'object') {
    Object.entries(data.products).forEach(([id, product]: any) => {
      if (!product.name) errors.push(`Product ${id} missing name`);
      if (!product.price && product.price !== 0) errors.push(`Product ${id} missing price`);
    });
  }

  // Validate categories structure
  if (data.categories && typeof data.categories === 'object') {
    Object.entries(data.categories).forEach(([id, category]: any) => {
      if (!category.name) errors.push(`Category ${id} missing name`);
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context as RequestContext<Env>;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    if (!env.R2_BUCKET) {
      console.error('R2_BUCKET binding not configured');
      return new Response(
        JSON.stringify({ error: 'R2_BUCKET binding not configured. Please add R2 bucket binding in Cloudflare Dashboard.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json() as PublishDataPayload;
    const { data } = body;

    if (!data) {
      return new Response(JSON.stringify({ error: 'No data provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate data before publishing
    const validation = validateData(data);
    if (!validation.valid) {
      console.warn('Data validation errors:', validation.errors);
      return new Response(
        JSON.stringify({
          error: 'Data validation failed',
          details: validation.errors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Add timestamp to the data
    const publishedData = {
      ...data,
      published_at: new Date().toISOString(),
      version: '1.0.0',
    };

    const jsonContent = JSON.stringify(publishedData, null, 2);
    const fileName = 'site-data.json';

    console.log('[PUBLISH] Starting publish to R2');
    console.log('[PUBLISH] File:', fileName);
    console.log('[PUBLISH] Size:', jsonContent.length, 'bytes');
    console.log('[PUBLISH] Data keys:', Object.keys(data));
    console.log('[PUBLISH] Products count:', Object.keys(data.products || {}).length);
    console.log('[PUBLISH] Categories count:', Object.keys(data.categories || {}).length);

    // Upload to R2
    const uploadStart = Date.now();
    await env.R2_BUCKET.put(fileName, jsonContent, {
      httpMetadata: {
        contentType: 'application/json',
        cacheControl: 'max-age=300',
      },
    });
    const uploadTime = Date.now() - uploadStart;

    console.log(`[PUBLISH] Successfully uploaded to R2 in ${uploadTime}ms`);

    // Verify the upload by reading it back
    const verifyStart = Date.now();
    const verifiedObject = await env.R2_BUCKET.get(fileName);
    const verifyTime = Date.now() - verifyStart;

    if (!verifiedObject) {
      throw new Error('Failed to verify published data in R2');
    }

    const verifiedContent = await verifiedObject.text();
    const verifiedData = JSON.parse(verifiedContent);

    console.log(`[PUBLISH] Verified published data in ${verifyTime}ms`);
    console.log('[PUBLISH] Verified data keys:', Object.keys(verifiedData));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Data published successfully and verified',
        published_at: publishedData.published_at,
        fileName,
        size: jsonContent.length,
        uploadTime,
        verifyTime,
        dataKeys: Object.keys(data),
        productCount: Object.keys(data.products || {}).length,
        categoryCount: Object.keys(data.categories || {}).length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[PUBLISH ERROR]', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Publish failed',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};
