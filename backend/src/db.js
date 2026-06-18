import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data.json');

const initialData = {
  users: [],
  hospitals: [],
  bloodRequests: [],
  sosAlerts: [],
  alerts: [],
  donations: []
};

let data = { ...initialData };

export function initDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      data = JSON.parse(raw);
    } else {
      saveDB();
    }
  } catch {
    data = { ...initialData };
    saveDB();
  }
}

export function saveDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Generic query helpers
export function getAll(collection) {
  return data[collection] || [];
}

export function getById(collection, id) {
  return (data[collection] || []).find(item => item.id === id) || null;
}

export function findBy(collection, predicate) {
  return (data[collection] || []).filter(predicate);
}

export function findOne(collection, predicate) {
  return (data[collection] || []).find(predicate) || null;
}

export function insert(collection, item) {
  if (!data[collection]) data[collection] = [];
  data[collection].push(item);
  saveDB();
  return item;
}

export function update(collection, id, updates) {
  const idx = (data[collection] || []).findIndex(item => item.id === id);
  if (idx === -1) return null;
  data[collection][idx] = { ...data[collection][idx], ...updates };
  saveDB();
  return data[collection][idx];
}

export function remove(collection, id) {
  const idx = (data[collection] || []).findIndex(item => item.id === id);
  if (idx === -1) return null;
  const removed = data[collection][idx];
  data[collection].splice(idx, 1);
  saveDB();
  return removed;
}

export function count(collection) {
  return (data[collection] || []).length;
}

export default {
  initDB, saveDB, getAll, getById, findBy, findOne, insert, update, remove, count
};
