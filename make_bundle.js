const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const projects = JSON.parse(fs.readFileSync(path.join(dataDir, 'oric_projects_db.json'), 'utf8'));
const industrialAreas = JSON.parse(fs.readFileSync(path.join(dataDir, 'karachi_industrial_areas.json'), 'utf8'));
const sectors = JSON.parse(fs.readFileSync(path.join(dataDir, 'industrial_sectors.json'), 'utf8'));
const evidence = JSON.parse(fs.readFileSync(path.join(dataDir, 'evidence_sources.json'), 'utf8'));
const stats = JSON.parse(fs.readFileSync(path.join(dataDir, 'dashboard_stats.json'), 'utf8'));

const bundleContent = `// Auto-generated data bundle for ORIC-IOAP platform
// Ensures instant zero-latency loading and seamless execution under both http:// and file:// protocols
window.ORIC_INITIAL_DATA = {
  projects: ${JSON.stringify(projects)},
  industrialAreas: ${JSON.stringify(industrialAreas)},
  sectors: ${JSON.stringify(sectors)},
  evidence: ${JSON.stringify(evidence)},
  stats: ${JSON.stringify(stats)}
};
console.log('ORIC-IOAP: Preloaded ' + window.ORIC_INITIAL_DATA.projects.length + ' research projects from Salim Habib University.');
`;

fs.writeFileSync(path.join(dataDir, 'data_bundle.js'), bundleContent, 'utf8');
console.log(`Generated data_bundle.js (${(bundleContent.length / 1024).toFixed(1)} KB)`);
