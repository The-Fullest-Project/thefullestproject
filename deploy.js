require('dotenv').config();
const ftp = require('basic-ftp');
const path = require('path');

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log('Connecting to GoDaddy FTP...');
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: true
    });

    const localDir = path.join(__dirname, '_site');
    const remoteDir = process.env.FTP_REMOTE_DIR || '/public_html';

    console.log(`Uploading ${localDir} to ${remoteDir}...`);
    await client.ensureDir(remoteDir);
    await client.clearWorkingDir();
    await client.uploadFromDir(localDir);

    console.log('Deploy complete!');
  } catch (err) {
    console.error('Deploy failed:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
