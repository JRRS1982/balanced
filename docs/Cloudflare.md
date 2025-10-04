# Cloudflare

This app is deployed on a Raspberry Pi. The Raspberry Pi is connected to the internet through a Cloudflare account, this provides a secure tunnel to running app in the Raspberry Pi without opening ports on the router.

1. Users visit a URL, this request goes through AWS Route 53, and resolves to Cloudflare's edge network.
2. Cloudflare authenticates and filters the request.
3. Cloudflare routes the request to the Raspberry Pi through a secure tunnel.
4. The nginx service on the Raspberry Pi routes the request to the app.
5. The app processes the request and returns a response.
6. The nginx service on the Raspberry Pi routes the response to the user.
7. Cloudflare routes the response to the user.
8. The user receives the response.
