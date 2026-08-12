# Payment Skill — Setup Guide

## Dependencies

Python 3.8+ required.

### Python Packages

```bash
pip install -r requirements.txt
```

### System Dependency (QR Decoding)

`pyzbar` requires the `zbar` system library:

| Platform | Command |
|----------|---------|
| macOS | `brew install zbar` |
| Ubuntu/Debian | `sudo apt-get install libzbar0` |

> If you see "No QR decoder available", ensure `zbar` is installed.

## API Credentials

You need a Binance API Key with payment permissions.

### Get Credentials

1. Binance App → Profile → API Management
2. Create a new API Key with **payment permissions**
3. Note down the API Key and Secret

### Configure

On first run, the skill auto-creates a `config.json` template. Edit it with your credentials:

```json
{
  "configured": true,
  "api_key": "YOUR_API_KEY",
  "api_secret": "YOUR_API_SECRET"
}
```

`base_url` is pre-configured to `https://bpay.binanceapi.com` by default. Do not modify unless instructed.

Or use environment variables as an alternative:

```bash
export PAYMENT_API_KEY='your_key'
export PAYMENT_API_SECRET='your_secret'
```

### Verify Configuration

```bash
python payment_skill.py --action config
```

## Payment Limits (Required for First Use)

Before your first payment, you must configure Agent Pay limits in the Binance App:

1. Binance App → Profile → Payment → **Agent Pay Settings**
2. Complete MFA verification
3. Set **single-transaction limit** and **daily limit**

> If you see error `LIMIT_NOT_CONFIGURED (-7100)`, complete this step first.

## Security

- Never commit `config.json` with real credentials to git
- API credentials are stored locally only
- Never share your API Key and Secret
- Payment always requires explicit user confirmation
- Multiple layers of duplicate payment protection (local state + backend validation)
