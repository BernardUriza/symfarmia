import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma || new PrismaClient({ log: ['error'] });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

const cache = new Map();
function cacheResult(key, value, ttl = 60000) {
  cache.set(key, { value, expires: Date.now() + ttl });
}
function getCached(key) {
  const item = cache.get(key);
  if (item && item.expires > Date.now()) return item.value;
  cache.delete(key);
  return null;
}

const ENC_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
const IV_LENGTH = 16;
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(ENC_KEY, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}
function decrypt(data) {
  const [ivHex, encryptedHex] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(ENC_KEY, 'hex'), iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

prisma.$use(async (params, next) => {
  const start = Date.now();
  if (params.model === 'Patient' && ['create', 'update'].includes(params.action)) {
    if (params.args.data.information) {
      params.args.data.information = encrypt(params.args.data.information);
    }
  }
  let result = await next(params);
  if (params.model === 'Patient' && ['findUnique', 'findMany'].includes(params.action)) {
    const decode = (rec) => {
      if (rec && rec.information) rec.information = decrypt(rec.information);
      return rec;
    };
    if (Array.isArray(result)) result = result.map(decode);
    else result = decode(result);
  }
  const duration = Date.now() - start;
  console.info('[AUDIT]', { model: params.model, action: params.action, duration });
  return result;
});

export function cachedQuery(key, fn, ttl = 60000) {
  const cached = getCached(key);
  if (cached) return Promise.resolve(cached);
  return fn().then((res) => {
    cacheResult(key, res, ttl);
    return res;
  });
}

export default prisma;
