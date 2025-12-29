<p align="center">
  <img src="extension/icon128.png" alt="KeepIt" width="96">
</p>

# KeepIt

A privacy-first web page clipper. Save pages from your browser to your own server.

**No cloud. No accounts. Your data stays yours.**

## How It Works

1. One click on the extension icon saves the current page
2. Content is sent to your self-hosted backend
3. Saved as a markdown file you can read anywhere

## Quick Start

### 1. Generate a Secret Token

```bash
# On macOS/Linux
openssl rand -hex 32

# Or use any password manager to generate a random string
```

Save this token - you'll need it for both the server and extension.

### 2. Start the Backend

```bash
cd keepit

# Set your token
export KEEPIT_TOKEN="your-token-here"

# Start the server
docker compose up -d
```

The server runs on `http://localhost:8000`. Saved pages go to `./data/`.

### 3. Install the Browser Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension/` folder

### 4. First Click: Configure

1. Click the KeepIt icon - settings popup opens (first time only)
2. Enter your server URL: `http://localhost:8000`
3. Enter your auth token
4. Click **Save & Close**

### 5. Save Pages

Just click the extension icon. One click = page saved.

Badge feedback:
- `...` = clipping in progress
- `✓` = success
- `✗` = error (check console for details)

**To change settings later:** Right-click the extension icon → "KeepIt Settings"

## Tailscale Setup (Access from Anywhere)

If you want to access your KeepIt server from other devices on your Tailscale network:

1. Install Tailscale on the machine running the backend
2. Note your machine's Tailscale IP (e.g., `100.x.y.z`)
3. In the extension, use `http://100.x.y.z:8000` as the server URL

No ports to forward. No public exposure. Just works.

## File Format

Saved pages are stored as markdown:

```
data/
├── 2024-12-29_142530_how-to-cook-pasta.md
├── 2024-12-29_153045_interesting-article.md
└── ...
```

Each file contains:

```markdown
---
url: https://example.com/article
saved: 2024-12-29T14:25:30Z
---

# Page Title

[page content as plain text]
```

Works great with Obsidian, VS Code, or any text editor.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KEEPIT_TOKEN` | Auth token (required) | - |
| `KEEPIT_DATA_DIR` | Where to save files | `/data` |

### Custom Port

Edit `docker-compose.yml`:

```yaml
ports:
  - "3000:8000"  # Change 3000 to your preferred port
```

## Security Notes

- **Token auth**: A shared secret between extension and server
- **No public exposure**: Run on localhost or Tailscale only
- **No database**: Just plain files, easy to backup
- **No telemetry**: Zero external connections

For maximum safety:
- Use a strong random token (32+ characters)
- Never expose port 8000 to the public internet
- Use Tailscale for remote access instead of port forwarding

## Development

### Run Backend Locally (without Docker)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

export KEEPIT_TOKEN="dev-token"
export KEEPIT_DATA_DIR="./data"
uvicorn main:app --reload
```

### Regenerate Extension Icons

```bash
cd extension/icons
python generate.py
```

## Troubleshooting

**"Missing or invalid authorization header"**  
Check that your token is entered correctly in both the extension and server.

**"Failed to fetch" in extension**  
- Is the server running? Check `docker compose ps`
- Is the URL correct? Include `http://` and the port
- If using Tailscale, is Tailscale connected on both devices?

**Pages not saving**  
Check the `./data` directory exists and is writable.

## License

MIT
