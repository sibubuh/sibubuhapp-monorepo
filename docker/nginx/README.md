# nginx

| File | Scope |
|---|---|
| `bubuh.conf` | Production reverse proxy for `bubuh.id` and `cms.bubuh.id`. Not used by `compose.yaml`. |
| `nginx-minio.conf` | MinIO fronting, unrelated to the site. |

## Installing `bubuh.conf`

The VPS runs nginx directly (`nginx/1.24.0 (Ubuntu)`), with the frontend on
port 3000 and Strapi on 3080 (see `ecosystem.config.js`). The file here is the
reviewable source of truth; the server gets a symlink to it:

```bash
# on the VPS, from the repo checkout at /var/www/sibubuhapp
sudo ln -sf /var/www/sibubuhapp/docker/nginx/bubuh.conf \
            /etc/nginx/sites-available/bubuh.conf
sudo ln -sf /etc/nginx/sites-available/bubuh.conf \
            /etc/nginx/sites-enabled/bubuh.conf

# remove whatever config previously served these hosts, then:
sudo nginx -t && sudo systemctl reload nginx
```

`gzip` directives at the top of `bubuh.conf` sit at `http` level in a stock
Debian/Ubuntu layout (`sites-enabled/*` is included from inside `http`). If
your nginx includes this file from somewhere else, move the `gzip` block into
`nginx.conf` instead — nginx will refuse to start otherwise.

HTTP/2 is enabled with `listen 443 ssl http2;` because the VPS runs nginx
1.24.0. From 1.25.1 onwards that spelling logs a deprecation warning — replace
it with plain `listen 443 ssl;` plus a separate `http2 on;` when you upgrade.

## Verifying

```bash
curl -s -o /dev/null -w "%{http_version}\n" https://bubuh.id/          # expect 2
curl -sI -H "Accept-Encoding: gzip" https://bubuh.id/assets/<hash>.js \
  | grep -i content-encoding                                           # expect gzip
curl -sI https://cms.bubuh.id/uploads/<file>.jpg | grep -i cache-control
# expect: public, max-age=2592000, immutable

# CORS must still be intact — the hero <img> uses crossorigin.
curl -sI -H "Origin: https://bubuh.id" https://cms.bubuh.id/uploads/<file>.jpg \
  | grep -i access-control-allow-origin
```
