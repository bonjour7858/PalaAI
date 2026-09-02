import { createClient } from '@supabase/supabase-js';
import ws from 'ws'; 

const supabaseUrl = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Erreur : Variables Supabase manquantes.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function scrapeWiki() {
  console.log("Démarrage du scraping...");
  
  
  console.log("Scraping terminé avec succès !");
}

scrapeWiki().catch((err) => {
  console.error("Erreur critique lors du scraping :", err);
  process.exit(1);
});
