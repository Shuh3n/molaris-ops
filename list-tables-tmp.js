require('dotenv').config();
const axios = require('axios');

const supabaseUrl = process.env.SUPABASE_URL || "";
const pat = process.env.SUPABASE_ACCESS_TOKEN_MOLARIS || "";
const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];

if (!projectRef || !pat) {
  console.error("Error: Falta SUPABASE_URL o SUPABASE_ACCESS_TOKEN_MOLARIS en el .env");
  process.exit(1);
}

const api = axios.create({
  baseURL: 'https://api.supabase.com/v1',
  headers: {
    'Authorization': `Bearer ${pat}`,
    'Content-Type': 'application/json'
  }
});

async function listTables() {
  try {
    const res = await api.get(`/projects/${projectRef}/database/tables`);
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Error al listar tablas:", err.response?.data?.message || err.message);
  }
}

listTables();
