const fs = require('fs');
const path = require('path');
const version = require('../package.json').version;

const distPackagePath = path.join(__dirname, '..', 'dist', 'package.json');
const distPackage = JSON.parse(fs.readFileSync(distPackagePath));
distPackage.version = version;
distPackage.dependencies.imask = '^' + version;
fs.writeFileSync(distPackagePath, JSON.stringify(distPackage, null, '  '));
