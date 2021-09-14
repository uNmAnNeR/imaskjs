const fs = require('fs');
const path = require('path');
const pkg = require('../package.json')

const distPackagePath = path.join(__dirname, '..', 'dist', 'package.json');
const distPackage = JSON.parse(fs.readFileSync(distPackagePath));
distPackage.version = pkg.version;
distPackage.dependencies.imask = pkg.dependencies.imask;
fs.writeFileSync(distPackagePath, JSON.stringify(distPackage, null, '  '));
