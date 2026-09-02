import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Erreur : Variables Supabase manquantes.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Récupération des URLs non scrapées...");
  const { data: urls, error } = await supabase
    .from('wiki_urls')
    .select('*')
    .eq('scraped', false);

  if (error || !urls) {
    console.error("Erreur de lecture de la table wiki_urls:", error);
    process.exit(1);
  }

  for (const item of urls) {
    console.log(`Scraping : ${item.url}`);
    try {
      const response = await fetch(item.url);
      if (!response.ok) continue;

      const html = await response.text();
      const $ = cheerio.load(html);

      const title = $('h1').first().text().trim() || 'Article Paladium';
      $('script, style, nav, footer, header').remove();
      const bodyText = $('main, article, body').text().replace(/\s+/g, ' ').trim();

      if (bodyText.length > 50) {
        const chunks = bodyText.match(/.{1,800}(?=\s|$)/g) || [bodyText];

        for (const chunk of chunks) {
          if (!chunk.trim()) continue;
          await supabase.from('documents').insert({
            url: item.url,
            title: title,
            content: chunk
          });
        }
      }

      await supabase.from('wiki_urls').update({ scraped: true }).eq('id', item.id);
      console.log(`Succès pour ${item.url}`);

    } catch (e) {
      console.error(`Erreur sur ${item.url}:`, e);
    }
  }

  console.log("Scraping terminé !");
}

run();
