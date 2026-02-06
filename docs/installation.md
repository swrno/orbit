# Installation Guide

Complete setup instructions for Orbit AI Workspace.

---

## Prerequisites

Before installing Orbit, ensure you have:

- **Node.js**: v18.17 or higher ([Download](https://nodejs.org))
- **npm**: v9 or higher (comes with Node.js)
- **Git**: For cloning the repository ([Download](https://git-scm.com))
- **Tambo API Key**: Sign up at [tambo.co](https://tambo.co) to get your API key

---

## Quick Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/orbit.git
cd orbit
```

### 2. Navigate to Web Directory

```bash
cd web
```

### 3. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 16 with Turbopack
- Material-UI components
- Tambo AI SDK (`@tambo-ai/react` and `@tambo-ai/typescript-sdk`)
- Zustand for state management
- All other dependencies

### 4. Configure Environment Variables

Create a `.env` file in the `web/` directory:

```bash
# web/.env
NEXT_PUBLIC_TAMBO_API_KEY=your_tambo_api_key_here
```

**Getting your Tambo API Key:**
1. Visit [tambo.co](https://tambo.co)
2. Sign up for a free account
3. Navigate to **Settings** → **API Keys**
4. Click **Create New Key**
5. Copy the key and paste it into your `.env` file

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Local**: [http://localhost:3000](http://localhost:3000)
- **Network**: `http://YOUR_IP:3000`

---

## Verify Installation

### Check Server Status

You should see output like:

```
▲ Next.js 16.1.6 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://10.145.124.222:3000
- Environments: .env

✓ Starting...
✓ Ready in 739ms
```

### Test Tambo AI Integration

1. Open [http://localhost:3000](http://localhost:3000)
2. Press **⌘K** (Mac) or **Ctrl+K** (Windows)
3. The AI chat should appear in the bottom-right corner
4. Try: `"What can you help me with?"`

If the AI responds, your Tambo integration is working correctly! ✅

---

## Production Build

### Build for Production

```bash
npm run build
```

This creates an optimized production build in `.next/`

### Start Production Server Locally

```bash
npm run start
```

The production server runs on [http://localhost:3000](http://localhost:3000)

---

## Deployment

### Deploy to Vercel (Recommended)

**Prerequisites:**
- Vercel account ([Sign up](https://vercel.com))
- Vercel CLI (optional)

**Option 1: Deploy via GitHub**
1. Push your code to GitHub
2. Visit [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variable:
   - Key: `NEXT_PUBLIC_TAMBO_API_KEY`
   - Value: Your Tambo API key
5. Click **Deploy**

**Option 2: Deploy via CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd web
vercel

# Follow prompts and add environment variables when asked
```

### Deploy to Other Platforms

Orbit works on any platform that supports Next.js:
- **Netlify**: Use Next.js plugin
- **Railway**: Automatic detection
- **DigitalOcean App Platform**: Detected automatically
- **AWS Amplify**: Add build settings
- **Docker**: Use included Dockerfile (if available)

**Environment Variables Required:**
- `NEXT_PUBLIC_TAMBO_API_KEY`

---

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on a different port
PORT=3001 npm run dev
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Hangs or Fails

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Tambo AI Not Working

1. **Check API Key**: Ensure `.env` file exists with valid key
2. **Restart Server**: Stop and restart `npm run dev`
3. **Check Console**: Open browser DevTools → Console for errors
4. **Verify Network**: Ensure you can reach `tambo.co` (no firewall blocks)

### TypeScript Errors

```bash
# Regenerate TypeScript types
rm -rf .next
npm run dev
```

---

## Development Tools

### Recommended VS Code Extensions

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - CSS autocomplete
- **TypeScript** - Type checking

### Useful Commands

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

---

## Next Steps

After successful installation:

1. **Read the User Guide**: See `docs/user-guide.md` to learn how to use Orbit
2. **Explore Tambo**: Check out [Tambo Documentation](https://docs.tambo.co)
3. **Create Your First Workspace**: Start building your project!

---

## System Requirements

### Minimum Requirements
- **OS**: macOS, Windows, Linux
- **RAM**: 4GB
- **Node.js**: v18.17+
- **Disk Space**: 500MB (including dependencies)

### Recommended Requirements
- **OS**: macOS, Windows 10+, Ubuntu 20.04+
- **RAM**: 8GB+
- **Node.js**: v20+
- **Disk Space**: 1GB

---

## Getting Help

- **Documentation**: Check `docs/` folder
- **Tambo Support**: [docs.tambo.co](https://docs.tambo.co)
- **GitHub Issues**: Report bugs or request features
- **Community**: Join discussions

---

**Installation complete!** 🎉 You're ready to start using Orbit AI Workspace.
