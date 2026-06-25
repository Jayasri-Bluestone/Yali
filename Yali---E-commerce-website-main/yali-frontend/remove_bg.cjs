const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  require.resolve('jimp');
} catch (e) {
  console.log('Installing jimp...');
  execSync('npm install jimp@0.22.10 --legacy-peer-deps', { stdio: 'inherit' });
}

const Jimp = require('jimp');

const dir = path.join(__dirname, 'src', 'assets', 'images');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png') && !f.includes('media__'));

async function processImage(file) {
  const filePath = path.join(dir, file);
  console.log(`Processing ${file}...`);
  try {
    const image = await Jimp.read(filePath);
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      const alpha = this.bitmap.data[idx + 3];

      // If the pixel is very close to white
      if (red > 240 && green > 240 && blue > 240) {
        this.bitmap.data[idx + 3] = 0; // set alpha to 0 (transparent)
      }
    });

    await image.writeAsync(filePath);
    console.log(`Successfully removed background for ${file}`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
}

async function main() {
  for (const file of files) {
    await processImage(file);
  }
  console.log('Done!');
}

main();
