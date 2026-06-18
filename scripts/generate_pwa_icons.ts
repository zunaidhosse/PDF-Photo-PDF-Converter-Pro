import sharp from 'sharp';
import path from 'path';

async function generate() {
  console.log('Generating crisp PNG launcher icons from SVGs using sharp...');
  try {
    const svgPath = path.join(process.cwd(), 'public', 'icon.svg');
    const out192 = path.join(process.cwd(), 'public', 'icon-192.png');
    const out512 = path.join(process.cwd(), 'public', 'icon-512.png');
    const outApple = path.join(process.cwd(), 'public', 'apple-touch-icon.png');
    const outFavicon = path.join(process.cwd(), 'public', 'favicon.png');

    // Generate 512x512 PNG
    await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toFile(out512);
    console.log('✓ Created 512x512 PNG icon at:', out512);

    // Generate 192x192 PNG
    await sharp(svgPath)
      .resize(192, 192)
      .png()
      .toFile(out192);
    console.log('✓ Created 192x192 PNG icon at:', out192);

    // Generate 180x180 apple-touch-icon.png
    await sharp(svgPath)
      .resize(180, 180)
      .png()
      .toFile(outApple);
    console.log('✓ Created 180x180 Apple Touch Icon at:', outApple);

    // Generate 32x32 favicon.png
    await sharp(svgPath)
      .resize(32, 32)
      .png()
      .toFile(outFavicon);
    console.log('✓ Created 32x32 browser favicon at:', outFavicon);

    console.log('PWA Icon Generation Complete!');
  } catch (err) {
    console.error('Error rendering PNG icons:', err);
  }
}

generate();
