import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type'
};

const SAFE_NAME_RE = /^[a-z0-9][a-z0-9_.-]{0,63}$/;
const HEX_64_RE = /^[0-9a-f]{64}$/;
const MAX_BATCH = 500;

type IncomingEvent = {
  occurred_at?: unknown;
  event_name?: unknown;
  source_name?: unknown;
  instance_digest?: unknown;
  event_digest?: unknown;
};

type IngestBody = {
  schema_version?: unknown;
  client?: unknown;
  events?: IncomingEvent[];
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json(405, { error: 'method_not_allowed' });
  }

  const apikey = request.headers.get('apikey') ?? request.headers.get('authorization') ?? '';
  if (!apikey) {
    return json(401, { error: 'missing_publishable_key' });
  }

  let body: IngestBody;
  try {
    body = (await request.json()) as IngestBody;
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  if (!Array.isArray(body.events) || body.events.length === 0 || body.events.length > MAX_BATCH) {
    return json(400, { error: 'invalid_batch' });
  }

  const schemaVersion = body.schema_version === 1 ? 1 : 1;
  const client = typeof body.client === 'string' && body.client.length > 0 ? body.client.slice(0, 64) : 'jbu-telemetry';

  const rows = [];
  for (const event of body.events) {
    if (
      typeof event?.occurred_at !== 'string' ||
      typeof event?.event_name !== 'string' ||
      typeof event?.source_name !== 'string' ||
      typeof event?.instance_digest !== 'string' ||
      typeof event?.event_digest !== 'string'
    ) {
      return json(400, { error: 'invalid_event_shape' });
    }

    if (!SAFE_NAME_RE.test(event.event_name) || !SAFE_NAME_RE.test(event.source_name)) {
      return json(400, { error: 'invalid_event_name' });
    }
    if (!HEX_64_RE.test(event.instance_digest) || !HEX_64_RE.test(event.event_digest)) {
      return json(400, { error: 'invalid_digest' });
    }

    const occurredAtMs = Date.parse(event.occurred_at);
    if (Number.isNaN(occurredAtMs)) {
      return json(400, { error: 'invalid_occurred_at' });
    }

    rows.push({
      event_at: new Date(occurredAtMs).toISOString(),
      event_name: event.event_name,
      source_name: event.source_name,
      instance_digest: event.instance_digest,
      event_digest: event.event_digest,
      schema_version: schemaVersion,
      client
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { error: 'missing_runtime_config' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const { error } = await supabase
    .from('jbu_telemetry_events')
    .upsert(rows, { onConflict: 'event_digest', ignoreDuplicates: true });

  if (error) {
    return json(500, { error: 'insert_failed' });
  }

  return json(200, { inserted: rows.length });
});
