const fs = require('fs');
const path = require('path');

const historyDir = 'C:\\Users\\AYOUB\\AppData\\Roaming\\Code\\User\\History';

if (!fs.existsSync(historyDir)) {
  console.log('No VS Code history dir found.');
  process.exit(0);
}

function searchHistory(dir) {
  const folders = fs.readdirSync(dir);
  for (const folder of folders) {
    const folderPath = path.join(dir, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        if (file === 'entries.json') {
          const entriesPath = path.join(folderPath, file);
          try {
            const data = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
            if (data.resource && data.resource.includes('Header.tsx')) {
              console.log(`FOUND Header.tsx history in ${folderPath}`);
              // list all versions
              const versions = data.entries.sort((a,b) => b.timestamp - a.timestamp);
              console.log(`Latest versions:`, versions.slice(0, 5));
              if (versions.length > 0) {
                const latestFile = path.join(folderPath, versions[0].id);
                console.log(`Copying latest to scratch/Header_vscode_backup.tsx`);
                fs.copyFileSync(latestFile, 'scratch/Header_vscode_backup.tsx');
              }
            }
          } catch(e) {}
        }
      }
    }
  }
}

searchHistory(historyDir);
console.log('Done searching VS Code history.');
