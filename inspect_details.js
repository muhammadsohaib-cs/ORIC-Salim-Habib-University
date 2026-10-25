const xlsx = require('xlsx');
const fs = require('fs');

const wb = xlsx.readFile('./2026-10-21 - FoP LMS Projects and Groups - Fall 26.xlsx');
const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

console.log('Total rows:', rows.length);
const teachers = new Set(rows.map(r => r['Teacher']).filter(Boolean));
console.log('Unique Faculty/Teachers (' + teachers.size + '):', Array.from(teachers));

const nonNullAbstracts = rows.filter(r => (r['Project Abstract'] || '').trim().length > 30);
console.log('Projects with detailed abstracts (>30 chars):', nonNullAbstracts.length);

// Print 5 detailed abstracts to see the academic depth
console.log('\n--- Sample Abstract Details ---');
nonNullAbstracts.slice(0, 4).forEach((r, idx) => {
  console.log(`\n[${idx+1}] Course: ${r['Course Title']}`);
  console.log(`Title: ${r['Project Name']}`);
  console.log(`Group: ${r['Group']} | Teacher: ${r['Teacher']}`);
  console.log(`Abstract preview: ${r['Project Abstract'].substring(0, 300)}...`);
});
