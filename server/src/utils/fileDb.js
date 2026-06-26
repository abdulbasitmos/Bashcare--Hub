const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data');

if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH);
}

const getFilePath = (key) => path.join(DB_PATH, `${key}.json`);

const readData = (key, defaultValue = []) => {
  const filePath = getFilePath(key);
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return defaultValue;
  }
};

const writeData = (key, data) => {
  const filePath = getFilePath(key);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
  }
};

module.exports = {
  readData,
  writeData
};
