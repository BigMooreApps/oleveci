import { supabase } from '../src/utils/supabaseClient';
import fs from 'fs';
import path from 'path';

async function uploadAssets() {
  const files = [
    { local: 'public/Icono_Oleveci_sin_fondo.png', dest: 'brand/Icono_Oleveci_sin_fondo.png', type: 'image/png' },
    { local: 'public/Logo_OleVeci.png', dest: 'brand/Logo_OleVeci.png', type: 'image/png' },
    { local: 'public/poster_bienvenida.jpg', dest: 'posts/poster_bienvenida.jpg', type: 'image/jpeg' },
    { local: 'public/Video_de_bienvenida.mp4', dest: 'posts/Video_de_bienvenida.mp4', type: 'video/mp4' },
  ];

  for (const f of files) {
    const fullPath = path.resolve(process.cwd(), f.local);
    if (!fs.existsSync(fullPath)) {
      console.log('File does not exist:', fullPath);
      continue;
    }
    const fileBuffer = fs.readFileSync(fullPath);
    console.log(`Subiendo ${f.local} (${fileBuffer.length} bytes)...`);
    const { data, error } = await supabase.storage.from('oleveci-media').upload(f.dest, fileBuffer, {
      contentType: f.type,
      upsert: true
    });
    if (error) {
      console.error('Error subiendo', f.dest, error);
    } else {
      const { data: pubData } = supabase.storage.from('oleveci-media').getPublicUrl(f.dest);
      console.log(`Éxito: ${f.dest} -> ${pubData.publicUrl}`);
    }
  }

  console.log('--- Subida a Supabase Storage finalizada ---');
}

uploadAssets().catch(console.error);
