 # Security Documentation

 This document describes the security hardening and requirements for the media server stack.

 ## VPN and Network Security
- All download traffic routed through Gluetun VPN with kill switch
- Isolated download network invisible to other services

 ## Reverse Proxy and SSL
- Traefik with Let's Encrypt for automatic certificate management
- No services exposed without SSL/TLS termination

 ## Container Hardening
- Non-root users and read-only filesystems
- Dropped capabilities except NET_BIND_SERVICE
- Use of Docker secrets for sensitive data

 ## Secrets Management
- Store API keys, passwords, and private keys as Docker secrets
- Do not commit secrets to version control

### Managed Secrets
- jellyfin_api_key
- sonarr_api_key
- radarr_api_key
- lidarr_api_key
- readarr_api_key
- bazarr_api_key
- tautulli_api_key
- photoprism_admin_password