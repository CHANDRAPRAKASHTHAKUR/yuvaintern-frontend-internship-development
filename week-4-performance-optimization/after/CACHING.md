# ==========================================================================
# Caching + compression configuration for the optimised build
# --------------------------------------------------------------------------
# Two equivalent files are provided:
#   • _headers   — Netlify / Cloudflare Pages format
#   • nginx.conf — nginx server block snippet
#
# Both implement the same policy:
#   1. Hashed / immutable build artefacts  -> 1 year, immutable
#   2. HTML                               -> must revalidate (no-cache)
#   3. Fonts                              -> 1 year, cross-origin
#   4. Images                             -> 30 days + revalidate
#   5. Brotli + gzip for all text types
# ==========================================================================

# ----------------------------- _headers -----------------------------------
/assets/*
  Cache-Control: public, max-age=2592000, stale-while-revalidate=86400
  Cache-Control: public, max-age=31536000, immutable      # add when filenames are hashed
  Vary: Accept-Encoding

/*.html
  Cache-Control: public, max-age=0, must-revalidate
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/css/*
  Cache-Control: public, max-age=31536000, immutable

/js/*
  Cache-Control: public, max-age=31536000, immutable

# ----------------------------- nginx.conf ---------------------------------
# server {
#     listen 443 ssl http2;
#     server_static.on;   # Netlify/Cloudflare only
#
#     # --- 1. Compression (Brotli first, gzip fallback) -------------------
#     brotli            on;
#     brotli_comp_level 5;
#     brotli_types      text/css text/plain application/javascript
#                       application/json image/svg+xml application/xml;
#     gzip              on;
#     gzip_vary         on;
#     gzip_min_length   256;
#     gzip_types        text/css text/plain application/javascript
#                       application/json image/svg+xml application/xml;
#
#     root /var/www/northwind;
#     index index.html;
#
#     # --- 2. Immutable hashed assets -------------------------------------
#     location ~* \.(?:css|js|woff2|jpg|jpeg|png|webp|avif|svg)$ {
#         add_header Cache-Control "public, max-age=31536000, immutable";
#         add_header Vary "Accept-Encoding";
#         access_log off;
#         try_files $uri =404;
#     }
#
#     # --- 3. HTML must always be revalidated ------------------------------
#     location = /index.html {
#         add_header Cache-Control "public, max-age=0, must-revalidate";
#         add_header X-Content-Type-Options "nosniff";
#         add_header Referrer-Policy "strict-origin-when-cross-origin";
#     }
#
#     # --- 4. The dynamic-import chunk may be cached for a day ------------
#     location = /js/analytics.js {
#         add_header Cache-Control "public, max-age=86400, stale-while-revalidate=604800";
#     }
#
#     # --- 5. Security headers --------------------------------------------
#     add_header X-Content-Type-Options   "nosniff"                always;
#     add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
#     add_header Content-Security-Policy  "default-src 'self'; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline'" always;
# }
