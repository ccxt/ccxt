# CCXT Playground — single image running the Next.js app + all language runtimes.
# The CONTAINER is the security boundary: user code executes inside it and can
# touch only the container filesystem. With no bind mounts and the resource
# limits in docker-compose.yml, nothing on the host is reachable. (Code from
# different users CAN see each other inside the container — acceptable per design.)

FROM node:24-bookworm

ENV DEBIAN_FRONTEND=noninteractive

# --- System runtimes: Python, PHP (+ extensions ccxt needs), composer ---
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl git unzip \
      python3 python3-venv python3-pip \
      php-cli php-curl php-mbstring php-bcmath php-gmp \
    && rm -rf /var/lib/apt/lists/* \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# --- Go (latest stable; ccxt's go module needs >= 1.24) ---
RUN GO_VERSION="$(curl -fsSL 'https://go.dev/VERSION?m=text' | head -1)" \
    && ARCH="$(dpkg --print-architecture)" \
    && case "$ARCH" in amd64) GOARCH=amd64 ;; arm64) GOARCH=arm64 ;; *) echo "unsupported arch $ARCH" && exit 1 ;; esac \
    && curl -fsSL "https://go.dev/dl/${GO_VERSION}.linux-${GOARCH}.tar.gz" | tar -C /usr/local -xz
ENV PATH="/usr/local/go/bin:${PATH}" GOTOOLCHAIN=local

# --- .NET SDK (for the C# runner) ---
RUN curl -fsSL https://dot.net/v1/dotnet-install.sh -o /tmp/dotnet-install.sh \
    && bash /tmp/dotnet-install.sh --channel 9.0 --install-dir /usr/share/dotnet \
    && rm /tmp/dotnet-install.sh
# Pin the NuGet package cache to a stable path used at BOTH build and runtime, so
# `dotnet run --no-restore` finds ccxt.dll regardless of the runtime user's HOME.
ENV PATH="/usr/share/dotnet:${PATH}" \
    DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_NOLOGO=1 \
    DOTNET_CLI_HOME=/app \
    DOTNET_ROOT=/usr/share/dotnet \
    NUGET_PACKAGES=/app/.nuget/packages

WORKDIR /app

# Node deps first (better layer caching). Use `npm ci` (lockfile-exact, fails on
# drift) rather than `npm install` — reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

# App source
COPY . .

# Sub-path the app is served under (e.g. /playground behind nginx). Baked into
# the build; empty = served at root.
ARG NEXT_BASE_PATH=""
ENV NEXT_BASE_PATH=${NEXT_BASE_PATH}

# Comma-separated languages to keep install-only (not executed), e.g. "go" to
# avoid Go's memory-heavy ccxt compile on a small host. Drives both the app
# (NEXT_PUBLIC_*) and the runtime warm-up script (PLAYGROUND_DISABLED).
ARG PLAYGROUND_DISABLED=""
ENV PLAYGROUND_DISABLED=${PLAYGROUND_DISABLED} \
    NEXT_PUBLIC_PLAYGROUND_DISABLED=${PLAYGROUND_DISABLED}

# Build the Next app, then provision + WARM every language runtime so the first
# user run is fast (python venv, php composer, go build cache, dotnet restore).
RUN npm run build \
    && bash scripts/setup-runtimes.sh

# Run as an unprivileged user; give it ownership of the warmed caches it writes to.
RUN useradd -m -u 1001 playground && chown -R playground:playground /app
USER playground

ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["npm", "run", "start"]
