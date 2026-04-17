require('dotenv').config();
const axios = require('axios');

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !anonKey) {
  console.error("Error: Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el .env");
  process.exit(1);
}

const restUrl = `${supabaseUrl}/rest/v1/`;

async function listTables() {
  try {
    const res = await axios.get(restUrl, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    
    // Las tablas están en definitions en el formato OpenAPI
    const tables = Object.keys(res.data.definitions || {});
    console.log("Tablas encontradas:");
    tables.forEach(t => console.log(`- ${t}`));
  } catch (err) {
    console.error("Error al listar tablas via PostgREST:", err.response?.data?.message || err.message);
  }
}

listTables();
