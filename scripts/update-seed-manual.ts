import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const SEED_SQL_PATH = path.join(ROOT_DIR, 'db', 'seed.sql');
const MANUAL_PATH = path.join(ROOT_DIR, 'docs', 'USER_OPERATIONS_MANUAL.md');

const manualContent = fs.readFileSync(MANUAL_PATH, 'utf-8');
// Escape single quotes for SQL string literal
const escapedContent = manualContent.replace(/'/g, "''");

const seedContent = fs.readFileSync(SEED_SQL_PATH, 'utf-8');

// Find the start of doc-4
const doc4Marker = "('doc-4','ApexTrack System Architecture, RBAC & Operations Manual','Architecture',";
const doc4Start = seedContent.indexOf(doc4Marker);

if (doc4Start !== -1) {
  // Find where doc-4 ends (ends before -- Attachment metadata)
  const attachMarker = "-- Attachment metadata";
  const attachPos = seedContent.indexOf(attachMarker, doc4Start);
  
  if (attachPos !== -1) {
    // Find the closing of doc-4 before attachPos
    const doc4End = seedContent.lastIndexOf(");", attachPos);
    
    const before = seedContent.substring(0, doc4Start + doc4Marker.length);
    const after = seedContent.substring(doc4End);
    
    const replacement = `\n  '${escapedContent}',\n  'u1','u1', unixepoch('2026-10-06 01:00')*1000, unixepoch('2026-10-06 01:00')*1000`;
    
    const newSeed = before + replacement + after;
    fs.writeFileSync(SEED_SQL_PATH, newSeed, 'utf-8');
    console.log('[Seed] Successfully updated doc-4 inside db/seed.sql');
  }
}
