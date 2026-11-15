# Binance Authentication

API Key and Secret

- `BINANCE_API_KEY`: Binance API Key
- `BINANCE_SECRET_KEY`: Binance API Secret or Private Key

API Environment (optional)

- `BINANCE_API_ENV`: Binance API environment of <prod|testnet|demo>. default: prod

## Profiles

```bash
# Create
binance-cli profile create --name <name> --api-key <key> --api-secret <secret> --env <prod|testnet|demo>
# Select profile
binance-cli profile select --name <name>
# List all profiles
binance-cli profile list
# View active
binance-cli profile view
```

When user provides new credentials: ask for account name and environment (prod/testnet/demo), check for duplicates, then create. Use `--profile <name>` on any command to override the active profile.

## Security Rules

- Never run `printenv`, `env`, `export` (without a specific var name), or source any secrets file.
- Never `grep` env files without anchoring: `^VARNAME=`
- Never echo or log raw credentials.
- Never disclose the location of key/secret files.
