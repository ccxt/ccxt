# CCXT Playground — single image running the Next.js app + all language runtimes.
# The CONTAINER is the security boundary: user code executes inside it and can
# touch only the container filesystem. With no bind mounts and the resource
# limits in docker-compose.yml, nothing on the host is reachable. (Code from
# different users CAN see each other inside the container — acceptable per design.)

# --- Java: resolve the ccxt jar set in a THROWAWAY stage so Maven and its
# ~/.m2 cache never ship in the final image (runtime needs only the JDK) ---
FROM node:24-trixie AS java-libs
# empty = latest release on Maven Central; pin with --build-arg CCXT_JAVA_VERSION=4.5.70
ARG CCXT_JAVA_VERSION=""
# Trixie apt ships OpenJDK 21 (ccxt-java is class-file 65, needs JDK 21+) + Maven for resolve.
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates maven openjdk-21-jdk-headless \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /pg
COPY scripts/setup-runtimes.sh scripts/setup-runtimes.sh
COPY lib/runners/java/Playground.java lib/runners/java/Playground.java
RUN PLAYGROUND_DISABLED="python,php,go,csharp" CCXT_JAVA_VERSION="$CCXT_JAVA_VERSION" \
      bash scripts/setup-runtimes.sh \
    && test -f runtime/java/classes/Playground.class \
    && ls runtime/java/libs | grep -q '^ccxt-'

FROM node:24-trixie

ENV DEBIAN_FRONTEND=noninteractive

# --- System runtimes: Python, PHP (+ extensions ccxt needs), composer, JDK 21 ---
# JDK (not JRE) for the Java runner: single-file `java Main.java` needs the
# compiler. Jars come from the java-libs stage; Maven never enters this image.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl git unzip tar gzip \
      python3 python3-venv python3-pip \
      php-cli php-curl php-mbstring php-bcmath php-gmp \
      openjdk-21-jdk-headless \
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
    && bash /tmp/dotnet-install.sh --channel 10.0 --install-dir /usr/share/dotnet \
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

# Create the unprivileged user BEFORE the heavy steps and build as that user,
# so every file is owned correctly from the start. The previous layout ran the
# 10.5 GB build/warm layer as root and then `chown -R`ed /app in a separate
# RUN — overlayfs copy-up duplicated the entire tree into a second ~11 GB
# layer, doubling the image.
RUN useradd -m -u 1001 playground && chown playground:playground /app
USER playground

# Node deps first (better layer caching). Use `npm ci` (lockfile-exact, fails on
# drift) rather than `npm install` — reproducible builds.
COPY --chown=playground:playground package.json package-lock.json ./
RUN npm ci

# --- Language runtimes (~10 GB, ~18 min) -------------------------------------
# Deliberately BEFORE the app source: this layer depends only on the script, the
# resolved Java stage and the version pins, so an app-source edit reuses it from
# cache. Bundling it with `npm run build` after `COPY . .` (as this did) meant a
# one-line source change re-provisioned every runtime and produced a brand-new
# ~10 GB layer to push and pull — ~29 min of deploy for a one-line edit.
#
# Java jars + the precompiled Playground helper come from the throwaway resolve
# stage; setup-runtimes.sh detects them and skips re-resolving. Playground.java
# is copied too so the step stands alone if that stage is ever dropped.
COPY --from=java-libs --chown=playground:playground /pg/runtime/java ./runtime/java
COPY --chown=playground:playground scripts/setup-runtimes.sh scripts/setup-runtimes.sh
COPY --chown=playground:playground lib/runners/java/Playground.java lib/runners/java/Playground.java

# Comma-separated languages to keep install-only (not executed), e.g. "go" to
# avoid Go's memory-heavy ccxt compile on a small host. Drives both the app
# (NEXT_PUBLIC_*) and the runtime warm-up script (PLAYGROUND_DISABLED).
ARG PLAYGROUND_DISABLED=""
ENV PLAYGROUND_DISABLED=${PLAYGROUND_DISABLED} \
    NEXT_PUBLIC_PLAYGROUND_DISABLED=${PLAYGROUND_DISABLED}

# Python/PHP/C# resolve "latest" ccxt, so a cached layer pins whatever was
# current when it was built. Change this value to force a re-resolve; the deploy
# workflow passes an ISO week, refreshing the runtimes weekly.
ARG RUNTIMES_REV=""
RUN RUNTIMES_REV="$RUNTIMES_REV" bash scripts/setup-runtimes.sh

# --- App source + Next build (seconds, and a small layer) --------------------
COPY --chown=playground:playground . .

# Sub-path the app is served under (e.g. /playground behind nginx). Baked into
# the build; empty = served at root.
ARG NEXT_BASE_PATH=""
ENV NEXT_BASE_PATH=${NEXT_BASE_PATH}

RUN npm run build

ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["npm", "run", "start"]
