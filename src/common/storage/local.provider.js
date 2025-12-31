import fs from 'fs';
import path from 'path';

export const ensureUnitFolder = (unitId, type) => {
  const dir = path.join('common', 'storage', 'uploads', 'units', unitId, type);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

export const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};
