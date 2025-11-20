#!/usr/bin/env node

/**
 * Icon Generation Script for Taskable PWA
 * 
 * This script generates PWA icons from the source logo.
 * It requires sharp (npm install -D sharp) to be installed.
 * 
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.error('❌ Sharp is not installed. Please run: npm install -D sharp');
  process.exit(1);
}

const SOURCE_IMAGE = path.join(__dirname, '../public/usable-logo.webp');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// Icon sizes to generate
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Maskable icon sizes (with padding)
const MASKABLE_SIZES = [192, 512];

async function generateIcons() {
  // Create icons directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('✅ Created icons directory');
  }

  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error(`❌ Source image not found: ${SOURCE_IMAGE}`);
    console.log('\n📝 Please ensure usable-logo.webp exists in the public directory.');
    process.exit(1);
  }

  console.log('🎨 Generating PWA icons from source image...\n');

  // Generate regular icons
  for (const size of SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    
    await sharp(SOURCE_IMAGE)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 244, g: 243, b: 243, alpha: 1 } // #f4f3f3 (app background)
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated icon-${size}x${size}.png`);
  }

  // Generate maskable icons (with 20% padding for safe zone)
  for (const size of MASKABLE_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-maskable-${size}x${size}.png`);
    const padding = Math.floor(size * 0.2);
    const innerSize = size - (padding * 2);
    
    // Create a canvas with background color and centered logo
    const background = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 52, g: 124, b: 191, alpha: 1 } // #347cbf (primary color)
      }
    }).png().toBuffer();

    const logo = await sharp(SOURCE_IMAGE)
      .resize(innerSize, innerSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    await sharp(background)
      .composite([{
        input: logo,
        top: padding,
        left: padding
      }])
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated icon-maskable-${size}x${size}.png`);
  }

  console.log('\n🎉 All icons generated successfully!');
  console.log(`📁 Icons saved to: ${OUTPUT_DIR}`);
}

generateIcons().catch(err => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});

