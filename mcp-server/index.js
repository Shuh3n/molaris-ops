require('dotenv').config({ path: '../.env' });
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const axios = require('axios');

const server = new Server({
  name: "supabase-mcp-server",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

// Extraemos el project_ref de la URL (ej: https://abc.supabase.co -> abc)
const supabaseUrl = process.env.SUPABASE_URL || "";
const pat = process.env.SUPABASE_ACCESS_TOKEN_MOLARIS || "";
const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];

const api = axios.create({
  baseURL: 'https://api.supabase.com/v1',
  headers: {
    'Authorization': `Bearer ${pat}`,
    'Content-Type': 'application/json'
  }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_tables",
        description: "List tables in the database",
      },
      {
        name: "run_query",
        description: "Execute arbitrary SQL query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "The SQL query to run" },
          },
          required: ["query"],
        },
      },
      {
        name: "deploy_function",
        description: "Deploy an Edge Function",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The function slug" },
            code: { type: "string", description: "The function code (Deno JS/TS)" },
          },
          required: ["slug", "code"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!projectRef) throw new Error("Could not determine Project Ref from SUPABASE_URL");

  try {
    switch (name) {
      case "list_tables": {
        const res = await api.get(`/projects/${projectRef}/database/tables`);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      }
      case "run_query": {
        // Nota: Supabase API no tiene un endpoint "run arbitrary SQL" público directo en /v1.
        // Se recomienda usar el endpoint de PostgREST o la DB directa si esto no alcanza.
        // Como alternativa para "list tables", ya tenemos el endpoint arriba.
        // Para queries generales, este endpoint suele ser parte de la API de base de datos si se activa.
        return { content: [{ type: "text", text: "Para ejecutar SQL directo, te recomiendo usar el cliente de Postgres o RPC. La Management API es limitada para SQL arbitrario por fuera de inspección." }] };
      }
      case "deploy_function": {
        const res = await api.post(`/projects/${projectRef}/functions`, {
          slug: args.slug,
          name: args.slug,
          body: args.code,
          verify_jwt: true
        });
        return { content: [{ type: "text", text: `Function ${args.slug} deployed: ${JSON.stringify(res.data)}` }] };
      }
      default:
        throw new Error(`Tool ${name} not found`);
    }
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err.response?.data?.message || err.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Supabase MCP Server running on stdio");
}

main().catch(console.error);
