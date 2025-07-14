# Development Scripts Guide

## Available Commands

### 🚀 Quick Start (Recommended)
```bash
npm run dev
```
Runs Next.js directly without Netlify's verbose logging.

### 🤫 Quiet Netlify Dev
```bash
npm run dev:quiet
```
Runs Netlify Dev with filtered output (no env var spam).

### 🌐 Full Netlify Dev (Verbose)
```bash
npm run dev:netlify
```
Original Netlify Dev with all logs (useful for debugging).

### 🧹 Clean Development
```bash
npm run dev:clean
```
Same as `npm run dev` - runs Next.js directly.

### 🔄 Reset and Run
```bash
npm run dev:reset
```
Clears .next cache and starts fresh.

## Ports

- **Next.js**: http://localhost:3000
- **Netlify Dev**: http://localhost:8888 (proxies to 3000)

## Troubleshooting

### If dependencies are missing:
```bash
npm install
```

### If ports are busy:
```bash
npm run kill:ports
```

### For a completely fresh start:
```bash
rm -rf node_modules .next
npm install
npm run dev
```