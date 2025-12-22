const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { testConnection, sequelize } = require('../config/database');
const ArtworkService = require('../services/artwork.service');
const { uploadBuffer, cloudinary } = require('../config/cloudinary');

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
    return true;
  } catch (err) {
    return false;
  }
}

async function run() {
  const args = process.argv.slice(2);
  const opts = {
    dir: 'seed/images',
    meta: 'seed/artworks.json',
    dryRun: false,
    webp: true,
    createdBy: null,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dir' && args[i+1]) { opts.dir = args[++i]; }
    if (a === '--meta' && args[i+1]) { opts.meta = args[++i]; }
    if (a === '--dry-run') { opts.dryRun = true; }
    if (a === '--no-webp') { opts.webp = false; }
    if (a === '--createdBy' && args[i+1]) { opts.createdBy = Number(args[++i]); }
  }

  console.log('Opciones de seed:', opts);

  // Ensure DB connection
  try {
    await testConnection();
  } catch (err) {
    console.error('Conexión a la BD fallida:', err.message || err);
    process.exit(1);
  }

  // Read metadata file (fall back to sample if not found)
  let metaPath = path.resolve(opts.meta);
  if (!fs.existsSync(metaPath)) {
    const sample = path.resolve('seed/artworks.sample.json');
    if (fs.existsSync(sample)) {
      console.warn(`Archivo de metadatos no encontrado en ${metaPath}, se usará el ejemplo ${sample}`);
      metaPath = sample;
    } else {
      console.error('No se encontró archivo de metadatos. Crea `seed/artworks.json` basado en `seed/artworks.sample.json`.');
      process.exit(1);
    }
  }

  let items;
  try {
    const raw = await fs.promises.readFile(metaPath, 'utf8');
    items = JSON.parse(raw);
    if (!Array.isArray(items)) throw new Error('el archivo de metadatos debe ser un array');
  } catch (err) {
    console.error('Error al leer/parsear metadatos:', err.message || err);
    process.exit(1);
  }

  const results = [];

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const idx = i + 1;
    console.log(`\n[${idx}/${items.length}] Procesando: ${it.image} - ${it.title}`);

    const imagePath = path.resolve(opts.dir, it.image);
    if (!await fileExists(imagePath)) {
      console.error('  -> Archivo de imagen no encontrado:', imagePath);
      results.push({ file: it.image, ok: false, error: 'imagen_no_encontrada' });
      continue;
    }

    // Build artwork data
    const title = it.title || '';
    const slug = it.slug && it.slug.trim() ? it.slug.trim() : slugify(title);
    const description = it.description || '';
    const dimensions = it.dimensions || null;
    const year = it.year ? Number(it.year) : null;
    const isFeatured = !!it.isFeatured;
    const createdBy = opts.createdBy || it.createdBy || null;

    // Check existing
    try {
      const existing = await ArtworkService.getArtworkBySlug(slug);
      if (existing) {
          console.log('  -> Ya existe una obra con ese slug, se omite:', slug);
          results.push({ file: it.image, ok: false, skipped: true, reason: 'exists', artworkId: existing.id });
        continue;
      }
    } catch (err) {
      console.warn('  -> Error checkeando la existencia:', err.message || err);
    }

    // Read file
    let buffer;
    try {
      buffer = await fs.promises.readFile(imagePath);
    } catch (err) {
      console.error('  -> Error leyendo el archivo:', err.message || err);
      results.push({ file: it.image, ok: false, error: 'lectura_fallida' });
      continue;
    }

    // Upload
    let uploadRes;
    try {
      if (opts.dryRun) {
        console.log('  -> dry-run: se simula la subida a Cloudinary');
      } else {
        const uploadOpts = { folder: 'karejackart/artworks' };
        if (opts.webp) {
          // Force webp conversion
          uploadOpts.transformation = [{ format: 'webp', quality: 'auto' }];
        } else {
          uploadOpts.transformation = [{ fetch_format: 'auto', quality: 'auto' }];
        }
        uploadRes = await uploadBuffer(buffer, uploadOpts.folder, uploadOpts);
        console.log('  -> subido:', uploadRes.secure_url);
      }
    } catch (err) {
      console.error('  -> Subida fallida:', err.message || err);
      results.push({ file: it.image, ok: false, error: 'subida_fallida', details: err.message });
      continue;
    }

    // Create DB record
    try {
      if (opts.dryRun) {
        console.log('  -> dry-run: se simula la creación del registro Artwork para', title);
        results.push({ file: it.image, ok: true, dryRun: true });
      } else {
        const data = {
          title,
          description,
          dimensions,
          year,
          imageUrl: uploadRes.secure_url,
          isFeatured,
          slug,
          createdBy,
        };

        const artwork = await ArtworkService.createArtwork(data);
        console.log('  -> Artwork creado id=', artwork.id);
        results.push({ file: it.image, ok: true, artworkId: artwork.id });
      }
    } catch (err) {
      console.error('  -> Falló la creación en la BD:', err.message || err);
      // cleanup upload
      try {
        if (uploadRes && uploadRes.public_id) {
          await cloudinary.uploader.destroy(uploadRes.public_id);
          console.log('  -> limpieza: imagen subida eliminada:', uploadRes.public_id);
        }
      } catch (cleanupErr) {
        console.error('  -> fallo en limpieza:', cleanupErr.message || cleanupErr);
      }
      results.push({ file: it.image, ok: false, error: 'db_create_failed', details: err.message });
      continue;
    }
  }

  // Write results
  try {
    const outPath = path.resolve('seed/seed-results.json');
    await fs.promises.writeFile(outPath, JSON.stringify(results, null, 2), 'utf8');
    console.log('\nSeed finalizado. Resultados escritos en', outPath);
  } catch (err) {
    console.error('Error escribiendo el archivo de resultados:', err.message || err);
  }

  process.exit(0);
}

if (require.main === module) {
  run();
}
