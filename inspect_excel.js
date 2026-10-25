const xlsx = require('xlsx');
const fs = require('fs');

const wb = xlsx.readFile('./2026-10-21 - FoP LMS Projects and Groups - Fall 26.xlsx');
const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

const byCourse = {};
rows.forEach(r => {
  const c = r['Course Title'] || 'Other';
  if (!byCourse[c]) byCourse[c] = [];
  byCourse[c].push(r);
});

console.log('--- COURSES AND PROJECTS SUMMARY ---');
Object.keys(byCourse).forEach(c => {
  const uniqueNames = [...new Set(byCourse[c].map(r => (r['Project Name'] || '').trim()).filter(Boolean))];
  console.log(`Course: ${c} | Total rows: ${byCourse[c].length} | Unique projects: ${uniqueNames.length}`);
  uniqueNames.slice(0, 3).forEach((n, i) => {
    console.log(`   ${i + 1}. ${n}`);
  });
});
