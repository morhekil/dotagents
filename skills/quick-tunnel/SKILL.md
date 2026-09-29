---
name: quick-tunnel
description: Expose a local HTTP server on a public URL with a Cloudflare quick tunnel (`cloudflared tunnel --url`). Use whenever something outside this machine must reach a local server — webhook callbacks, OAuth redirect URIs, sharing a dev preview or staging build with a person or another agent, testing on a phone or another device, or any "I need a public URL for localhost". Also use instead of ngrok, localtunnel, serveo, or deploying a throwaway app just to get a URL.
---

# Public URL for a local server

```bash
cloudflared tunnel --url http://localhost:8080
```

Prints a random `https://<random>.trycloudflare.com` URL that proxies to that local port. No account, no login, no config, no signup. `cloudflared` is installed (`brew install cloudflared` if a machine lacks it).

Reach for this before ngrok (account + rate limits), localtunnel, or deploying somewhere just to get a URL.

## Getting the URL non-interactively

The URL is printed to stderr, a few seconds after start. Run the tunnel in the background, log to a file, then grep:

```bash
cloudflared tunnel --url http://localhost:8080 --no-autoupdate > /tmp/tunnel.log 2>&1 &
grep -o 'https://[-a-z0-9]*\.trycloudflare\.com' /tmp/tunnel.log | head -1
```

The URL lands ~5s after start; if the grep comes back empty the tunnel is still connecting, so grep again in a couple of seconds. Kill the process when done; the URL dies with it.

## Know the limits

- **Ephemeral.** New random hostname on every start. Anything that stores a callback URL (webhook config, OAuth app) needs updating each restart.
- **200 concurrent requests**, and **no Server-Sent Events**. Long-poll or WebSocket-based dev servers may misbehave; SSE will not work at all.
- **Public and unauthenticated.** Anyone with the hostname reaches the local server. Do not point one at a service holding real credentials or production data, and tell the user when you open one.
- **Testing only**, no SLA. For anything that must survive a restart or keep a stable hostname, use a named tunnel (`cloudflared tunnel create`) on the user's own domain — that needs a Cloudflare account, so ask first.
