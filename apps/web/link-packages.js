const fs = require('fs');
const path = require('path');

const nodeModulesPath = path.join(__dirname, 'node_modules/@basagram');
const packagesPath = path.join(__dirname, '../../packages');

// Create @basagram directory
if (!fs.existsSync(nodeModulesPath)) {
  fs.mkdirSync(nodeModulesPath, { recursive: true });
}

// List of packages to link
const packages = ['ui', 'types', 'validation', 'utils'];

packages.forEach(pkg => {
  const linkPath = path.join(nodeModulesPath, pkg);
  const targetPath = path.join(packagesPath, pkg);

  // Remove existing symlink if present
  try {
    if (fs.existsSync(linkPath)) {
      fs.unlinkSync(linkPath);
    }
  } catch (e) {
    // Ignore
  }

  // Create symlink
  try {
    fs.symlinkSync(targetPath, linkPath, 'dir');
    console.log(`✓ Linked @basagram/${pkg}`);
  } catch (e) {
    console.warn(`⚠ Could not link @basagram/${pkg}:`, e.message);
  }
});

console.log('✓ All packages linked');
