const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create icon
const iconCanvas = createCanvas(1024, 1024);
const iconCtx = iconCanvas.getContext('2d');

// Draw icon background
iconCtx.fillStyle = '#4a90e2';
iconCtx.fillRect(0, 0, 1024, 1024);

// Draw circle
iconCtx.beginPath();
iconCtx.arc(512, 512, 400, 0, Math.PI * 2);
iconCtx.fillStyle = '#ffffff';
iconCtx.fill();

// Draw text
iconCtx.font = 'bold 200px Arial';
iconCtx.fillStyle = '#4a90e2';
iconCtx.textAlign = 'center';
iconCtx.textBaseline = 'middle';
iconCtx.fillText('HF', 512, 512);

// Save icon
const iconBuffer = iconCanvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, 'icon.png'), iconBuffer);

// Create splash screen
const splashCanvas = createCanvas(1024, 1024);
const splashCtx = splashCanvas.getContext('2d');

// Draw splash background
const gradient = splashCtx.createLinearGradient(0, 0, 1024, 1024);
gradient.addColorStop(0, '#4a90e2');
gradient.addColorStop(1, '#357abd');
splashCtx.fillStyle = gradient;
splashCtx.fillRect(0, 0, 1024, 1024);

// Draw text
splashCtx.font = 'bold 72px Arial';
splashCtx.fillStyle = '#ffffff';
splashCtx.textAlign = 'center';
splashCtx.textBaseline = 'middle';
splashCtx.fillText('Hybrid Framework', 512, 512);

// Save splash screen
const splashBuffer = splashCanvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, 'splash.png'), splashBuffer);
