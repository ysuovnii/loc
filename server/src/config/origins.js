const DEFAULT_ORIGINS = ['http://localhost:5173'];

const parseOrigins = (raw) => {
  if (!raw) return DEFAULT_ORIGINS;
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export default parseOrigins;