# syntax=docker/dockerfile:1.7
#
# CCXT build & test environment with every target-language toolchain:
#   TypeScript/JavaScript (Node), Python, PHP, C# (.NET), Go, Java, Rust
#
#     docker compose run --rm ccxt          # interactive shell, repo bind-mounted at /ccxt
#     docker build -t ccxt .                # standalone image (repo copied into /ccxt)
#
# Stages:
#   go / java / rust / dotnet / composer  - pinned upstream toolchain images, copied from
#   base                                  - OS packages + Node + PHP + Python runtimes
#   deps                                  - npm / composer / pip dependencies (cached on manifests only)
#   dev (final)                           - full source tree + all toolchains
#
# Toolchain versions mirror .github/workflows/*.yml.

ARG UBUNTU_VERSION=24.04
ARG NODE_MAJOR=22
ARG PHP_VERSION=8.5
ARG GO_VERSION=1.25
ARG JAVA_VERSION=21
ARG DOTNET_VERSION=10.0
ARG RUST_VERSION=1

# ---------------------------------------------------------------------------
# Toolchain source stages (only their install trees are copied into the final image)
# ---------------------------------------------------------------------------
FROM golang:${GO_VERSION}-bookworm AS go
FROM eclipse-temurin:${JAVA_VERSION}-jdk-noble AS java
FROM rust:${RUST_VERSION}-slim-bookworm AS rust
RUN rustup component add clippy rustfmt
FROM mcr.microsoft.com/dotnet/sdk:${DOTNET_VERSION}-noble AS dotnet
FROM composer:2 AS composer

# ---------------------------------------------------------------------------
# base: OS packages + Node + PHP + Python
# ---------------------------------------------------------------------------
FROM ubuntu:${UBUNTU_VERSION} AS base
ARG NODE_MAJOR
ARG PHP_VERSION

# Suppresses unwanted user interaction (like "Please select the geographic area" when installing tzdata)
ENV DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates curl gnupg git software-properties-common \
        build-essential pkg-config libssl-dev \
        zip unzip xz-utils \
        # .NET runtime dependencies
        libicu74 libgcc-s1 libstdc++6 zlib1g tzdata \
        # Python
        python3 python3-venv python3-dev \
    # PHP (ondrej PPA, same major/minor as CI)
    && add-apt-repository -y ppa:ondrej/php \
    # Node (nodesource)
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        nodejs \
        php${PHP_VERSION}-cli php${PHP_VERSION}-curl php${PHP_VERSION}-mbstring php${PHP_VERSION}-bcmath \
        php${PHP_VERSION}-gmp php${PHP_VERSION}-zip php${PHP_VERSION}-xml \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Python lives in a venv (Ubuntu 24.04 python is PEP 668 "externally managed")
ENV VIRTUAL_ENV=/opt/venv
ENV PATH="${VIRTUAL_ENV}/bin:${PATH}"
RUN python3 -m venv "${VIRTUAL_ENV}" && pip install --no-cache-dir --upgrade pip

COPY --from=composer /usr/bin/composer /usr/local/bin/composer

# ---------------------------------------------------------------------------
# deps: package-manager dependencies, cached as long as the manifests don't change
# ---------------------------------------------------------------------------
FROM base AS deps
WORKDIR /ccxt

COPY build/ci-requirements.txt /tmp/ci-requirements.txt
RUN pip install --no-cache-dir -r /tmp/ci-requirements.txt

COPY package.json package-lock.json .npmrc postinstall.js ./
RUN npm ci --include=dev --no-audit --no-fund

COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-autoloader --no-scripts --prefer-dist

# ---------------------------------------------------------------------------
# dev: final image with the source tree and every toolchain
# ---------------------------------------------------------------------------
FROM deps AS dev

# Go
ENV GOROOT=/usr/local/go \
    GOPATH=/root/go
COPY --from=go /usr/local/go /usr/local/go

# Java
ENV JAVA_HOME=/opt/java/openjdk
COPY --from=java /opt/java/openjdk /opt/java/openjdk

# Rust
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo
COPY --from=rust /usr/local/rustup /usr/local/rustup
COPY --from=rust /usr/local/cargo /usr/local/cargo

# .NET
ENV DOTNET_ROOT=/usr/share/dotnet \
    DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_NOLOGO=1
COPY --from=dotnet /usr/share/dotnet /usr/share/dotnet

ENV PATH="${GOPATH}/bin:${GOROOT}/bin:${JAVA_HOME}/bin:${CARGO_HOME}/bin:${DOTNET_ROOT}:${PATH}"

# PHP tests require assertions enabled (same ini-values as .github/workflows/php.yml)
ARG PHP_VERSION
RUN printf 'zend.assertions=1\ndisplay_errors=On\n' > /etc/php/${PHP_VERSION}/cli/conf.d/99-ccxt.ini

COPY . /ccxt

# Installs as a local Node & Python module so that `require ('ccxt')` and `import ccxt` work
RUN composer dump-autoload --no-interaction \
    && pip install --no-cache-dir --no-deps -e . \
    && ln -s /ccxt /usr/lib/node_modules/ccxt \
    && (cd go && go mod download)
ENV NODE_PATH=/usr/lib/node_modules

# Fail the build early if any toolchain is missing
RUN node --version && npm --version \
    && python --version && pip --version \
    && php --version && composer --version \
    && dotnet --list-sdks \
    && go version \
    && java -version \
    && cargo --version && rustc --version

CMD ["/bin/bash"]
