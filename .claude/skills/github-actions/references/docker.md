# Docker Reference

## Contents
- Current State
- When Docker Would Help
- Recommended Approach
- Local Development Container
- CI/CD with Docker

## Current State

This project does **not use Docker**. All CI/CD runs directly on `ubuntu-latest` GitHub Actions runners, and local development uses native Node.js and Python installations. For a static site deployed via FTP to GoDaddy shared hosting, this is a reasonable choice.

## When Docker Would Help

Docker becomes valuable for this project if:

1. **Environment parity** — Scraper failures caused by Python version or dependency differences between local and CI
2. **Onboarding** — New contributors need both Node.js 20+ and Python 3.12+ configured correctly
3. **Scraper isolation** — Scrapling uses browser automation that may behave differently across OSes

## Recommended Approach

If Docker is added, use it for **development environment consistency only** — not for production deployment (GoDaddy shared hosting doesn't support containers).

### Local Development Container

```dockerfile
# Dockerfile.dev
FROM node:20-slim

# Install Python for scrapers
RUN apt-get update && apt-get install -y python3.12 python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Install Python dependencies
COPY scrapers/requirements.txt ./scrapers/
RUN pip install --break-system-packages -r scrapers/requirements.txt

COPY . .

EXPOSE 8080
CMD ["npm", "run", "dev"]
```

### Docker Compose for Development

```yaml
# docker-compose.yml
services:
  dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "8080:8080"
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev
```

Run with: `docker compose up`

## Anti-Patterns

### WARNING: Don't Dockerize the Deploy

**The Problem:**

```dockerfile
# BAD - building a container to FTP files makes no sense
FROM node:20-slim
COPY _site/ /app/_site/
RUN npm install basic-ftp
CMD ["node", "deploy.js"]
```

**Why This Breaks:** GoDaddy shared hosting accepts static files via FTP. A Docker container adds complexity without value — you'd still need FTP credentials and network access. The GitHub Actions runner already handles this cleanly.

**The Fix:** Keep deployment as a direct FTP upload step in workflows. Docker is for dev environment consistency, not for wrapping a file transfer.

### WARNING: Don't Install Node Modules in Volumes

**The Problem:**

```yaml
# BAD - host node_modules overwrite container's
volumes:
  - .:/app
```

**Why This Breaks:** Mounting the full project directory replaces the container's `node_modules/` (which were built for Linux) with the host's (which may be Windows or macOS binaries). Native modules like those in scrapling will crash.

**The Fix:**

```yaml
# GOOD - anonymous volume preserves container's node_modules
volumes:
  - .:/app
  - /app/node_modules
```

The `/app/node_modules` anonymous volume prevents the host mount from overwriting it.

## CI/CD with Docker

If you add Docker to CI/CD, the most practical use is running scrapers in an isolated environment:

```yaml
# .github/workflows/scrape.yml — hypothetical Docker approach
jobs:
  scrape:
    runs-on: ubuntu-latest
    container:
      image: python:3.12-slim
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r scrapers/requirements.txt
      - run: python scrapers/run_all.py
      - uses: actions/upload-artifact@v4
        with:
          name: resource-data
          path: src/_data/resources/
```

However, using `actions/setup-python@v5` directly (as the project currently does) is simpler and sufficient. Only switch to container-based CI if you need system-level dependencies that `setup-python` can't provide.

## Decision: Docker vs Native

| Factor | Native (Current) | Docker |
|--------|-------------------|--------|
| CI/CD setup | Simpler | Extra build step |
| Local onboarding | Requires Node + Python | Just Docker |
| Build speed | Faster | Container overhead |
| Scraper reliability | OS-dependent | Consistent |
| Deploy target | FTP (no container support) | FTP (same) |

**Recommendation:** Stay native unless scraper environment issues become a recurring problem. The project's simplicity (static site + FTP) doesn't justify container orchestration overhead.

See the **python** skill for scraper environment details. See the **eleventy** skill for Node.js build requirements.
