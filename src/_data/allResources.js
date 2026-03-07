const fs = require('node:fs');
const path = require('node:path');

module.exports = function() {
  const statesDir = path.join(__dirname, 'resources', 'states');
  const nationalPath = path.join(__dirname, 'resources', 'national.json');

  let all = [];
  if (fs.existsSync(nationalPath)) {
    all = all.concat(JSON.parse(fs.readFileSync(nationalPath, 'utf8')));
  }
  if (fs.existsSync(statesDir)) {
    fs.readdirSync(statesDir).filter(f => f.endsWith('.json')).forEach(f => {
      const data = JSON.parse(fs.readFileSync(path.join(statesDir, f), 'utf8'));
      all = all.concat(data);
    });
  }
  return all;
};
