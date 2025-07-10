# SYMFARMIA - Netlify Deployment Guide

This guide provides comprehensive instructions for deploying the SYMFARMIA Next.js application to Netlify.

## 🚀 Quick Start

For immediate deployment, use our automated script:

```bash
./deploy-to-netlify.sh
```

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Netlify CLI** (auto-installed by deployment script)

### Required Accounts
- **Netlify Account** ([Sign up](https://netlify.com))
- **Auth0 Account** (for authentication)
- **PostgreSQL Database** (for production)
- **EdgeStore Account** (for file storage)

## 🏗️ Project Structure

```
symfarmia/
├── app/                    # Next.js App Router
├── netlify.toml           # Netlify configuration
├── next.config.js         # Next.js production config
├── deploy-to-netlify.sh   # Automated deployment script
├── .env.local.example     # Local environment template
├── .env.production.example # Production environment template
└── DEPLOYMENT.md          # This file
```

## ⚙️ Environment Configuration

### Local Development

1. Copy the local environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your development values:
   ```env
   # Auth0 Development
   AUTH0_SECRET=your-dev-secret-key-64-characters-minimum
   AUTH0_BASE_URL=http://localhost:3000
   AUTH0_ISSUER_BASE_URL=https://your-dev-tenant.auth0.com
   AUTH0_CLIENT_ID=your-dev-client-id
   AUTH0_CLIENT_SECRET=your-dev-client-secret
   
   # Database Development
   DATABASE_URL=postgresql://user:pass@localhost:5432/symfarmia_dev
   
   # EdgeStore Development
   EDGE_STORE_ACCESS_KEY=your-dev-access-key
   EDGE_STORE_SECRET_KEY=your-dev-secret-key
   ```

### Production Environment

Production environment variables are managed through Netlify's dashboard:

1. Log into [Netlify](https://app.netlify.com/)
2. Navigate to your site → **Site settings** → **Environment variables**
3. Add the following variables:

#### Required Production Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `NETLIFY` | Netlify detection | `true` |
| `AUTH0_SECRET` | Auth0 secret (64+ chars) | `your-prod-secret...` |
| `AUTH0_BASE_URL` | Your domain | `https://your-site.netlify.app` |
| `AUTH0_ISSUER_BASE_URL` | Auth0 tenant | `https://your-tenant.auth0.com` |
| `AUTH0_CLIENT_ID` | Auth0 client ID | `abc123...` |
| `AUTH0_CLIENT_SECRET` | Auth0 client secret | `secret123...` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `EDGE_STORE_ACCESS_KEY` | EdgeStore access | `es_access_...` |
| `EDGE_STORE_SECRET_KEY` | EdgeStore secret | `es_secret_...` |

#### Optional Production Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_MODE` | App mode | `production` |
| `LOG_LEVEL` | Logging level | `error` |
| `ENABLE_ANALYTICS` | Google Analytics | `false` |
| `GOOGLE_ANALYTICS_ID` | GA tracking ID | - |

## 🔧 Manual Deployment Steps

If you prefer manual deployment:

### 1. Prepare the Environment

```bash
# Install dependencies
npm ci

# Run quality checks
npm run lint
npm run type-check

# Run tests
npm test
```

### 2. Build the Application

```bash
# Production build
npm run build
```

### 3. Deploy via CLI

```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod --dir=.next

# Or deploy preview
netlify deploy --dir=.next
```

## 🏃‍♂️ Automated Deployment

The `deploy-to-netlify.sh` script automates the entire process:

### Features
- ✅ Prerequisites checking
- ✅ Environment selection (local/production)
- ✅ Pre-deployment security checks
- ✅ Code quality validation
- ✅ Automated testing
- ✅ Production building
- ✅ Netlify deployment
- ✅ Post-deployment verification

### Usage

```bash
# Make script executable (first time only)
chmod +x deploy-to-netlify.sh

# Run deployment
./deploy-to-netlify.sh
```

### Environment Options

1. **Local/Development**: Uses `.env.local` for environment variables
2. **Production**: Uses Netlify environment variables

## 🔒 Security Best Practices

### Environment Variables
- ❌ **NEVER** commit `.env` files to git
- ✅ Use `.env.example` files as templates
- ✅ Store production secrets in Netlify dashboard
- ✅ Use different secrets for development/production

### Code Security
- ✅ All sensitive files are in `.gitignore`
- ✅ Security headers configured in `netlify.toml`
- ✅ Auth0 handles authentication securely
- ✅ API routes have proper CORS configuration

### Pre-deployment Checks
The deployment script automatically checks for:
- Uncommitted sensitive files
- Environment variable leaks
- Git repository status
- Code quality issues

## 🌐 Domain Configuration

### Custom Domain Setup

1. **In Netlify Dashboard**:
   - Go to **Site settings** → **Domain management**
   - Click **Add custom domain**
   - Enter your domain (e.g., `symfarmia.com`)

2. **DNS Configuration**:
   - Add CNAME record: `www` → `your-site.netlify.app`
   - Add A record: `@` → Netlify's IP addresses

3. **SSL Certificate**:
   - Netlify automatically provisions SSL certificates
   - Force HTTPS in **Site settings** → **Domain management**

### Auth0 Configuration Update

After setting up your domain, update Auth0:

1. **Auth0 Dashboard** → **Applications** → **Your App**
2. Update **Allowed Callback URLs**:
   ```
   https://your-domain.com/api/auth/callback
   ```
3. Update **Allowed Logout URLs**:
   ```
   https://your-domain.com
   ```

## 📊 Performance Optimization

### Next.js Configuration

Our `next.config.js` includes:
- Image optimization with WebP/AVIF support
- Bundle splitting and tree shaking  
- Compression and caching headers
- Security headers

### Netlify Optimizations

The `netlify.toml` configures:
- Asset compression and minification
- CDN caching strategies
- Security headers
- Redirect rules

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

**Issue**: Build fails with TypeScript errors
```bash
# Solution: Fix type errors locally first
npm run type-check
```

**Issue**: Environment variables not found
```bash
# Solution: Check Netlify environment variables
netlify env:list
```

#### Deployment Issues

**Issue**: Functions not working
```bash
# Solution: Check function directory in netlify.toml
# Ensure API routes are in correct Next.js format
```

**Issue**: Auth0 login redirects fail
```bash
# Solution: Verify Auth0 callback URLs match your domain
# Check AUTH0_BASE_URL environment variable
```

### Debug Mode

Enable debug output in deployment:

```bash
# Set debug environment
export DEBUG=netlify*
./deploy-to-netlify.sh
```

### Log Access

View deployment logs:
1. Netlify Dashboard → **Deploys**
2. Click on specific deployment
3. View **Function logs** or **Deploy log**

## 📈 Monitoring & Analytics

### Netlify Analytics
- Enable in **Site settings** → **Analytics**
- View traffic, performance, and form submissions

### Application Monitoring
- Configure `GOOGLE_ANALYTICS_ID` for GA4
- Use Netlify's built-in performance monitoring
- Set up uptime monitoring with external services

## 🔄 CI/CD Integration

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=.next
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📞 Support

### Documentation
- [Netlify Docs](https://docs.netlify.com/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Auth0 Integration](https://auth0.com/docs/quickstart/webapp/nextjs)

### Community
- [Netlify Community](https://community.netlify.com/)
- [Next.js Discussions](https://github.com/vercel/next.js/discussions)

---

## 🚢 Ready to Deploy?

1. **First time setup**: Follow the environment configuration section
2. **Quick deployment**: Run `./deploy-to-netlify.sh`
3. **Custom domain**: Configure DNS and update Auth0
4. **Go live**: Your SYMFARMIA app is ready for users!

For questions or issues, refer to the troubleshooting section or create an issue in the repository.