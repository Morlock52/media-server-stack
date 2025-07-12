 # Media Server Stack Project

 ## Project Overview
 - **Infrastructure Type**: Docker Compose multi-container media server
 - **Primary Services**: Jellyfin, Sonarr, Radarr, Lidarr, Readarr, Prowlarr, qBittorrent, Overseerr, Bazarr, Tautulli, YouTubeDL-Material
 - **Security**: VPN-integrated downloading, reverse proxy with SSL
 - **Deployment Target**: Production Docker environment

 ## Tech Stack
 - **Container Runtime**: Docker Engine 24.0+
 - **Orchestration**: Docker Compose v2
 - **Reverse Proxy**: Traefik v3 with Let's Encrypt
 - **VPN Client**: Gluetun with WireGuard support
 - **Monitoring**: Prometheus + Grafana
 - **Networking**: Custom bridge networks with isolation

 ## Supported Media Types
 - Movies
 - TV Series
 - Anime
 - Music
 - Podcasts
 - Audiobooks
 - Books
 - Comics
 - Photos
 - Games
 - Online Videos

 ## Media Type → Service Mapping
 - Movies: Radarr
 - TV Series & Anime: Sonarr
 - Music: Lidarr
 - Books & Audiobooks: Readarr
 - Comics: Mylar
 - Podcasts: Podgrab
 - Photos: PhotoPrism
 - Subtitles: Bazarr
 - Requests: Overseerr
 - Transcoding & Streaming: Jellyfin
 - Online Video Acquisition: YouTubeDL-Material

 ## Service Dependencies
 - **Core Chain**: Gluetun → qBittorrent → *ARR Services → Jellyfin
 - **Proxy Chain**: Traefik → All web services
 - **Monitoring**: Prometheus → All services → Grafana

 ## Development Commands
 - `docker-compose up -d`: Start all services
 - `docker-compose -f compose/docker-compose.yml -f compose/compose.production.yml up -d`: Production start
 - `./scripts/deploy.sh`: Full deployment with health checks
 - `./scripts/backup.sh`: Backup configurations and data

 ## Security Requirements
 - **VPN Kill Switch**: All download traffic through Gluetun
 - **SSL Termination**: Traefik with automatic Let's Encrypt
 - **Container Security**: Non-root users, read-only filesystems
 - **Network Isolation**: Separate networks for different service tiers

 ## Performance Optimizations
 - **Hardware Acceleration**: GPU transcoding for Jellyfin
 - **RAM Transcoding**: tmpfs mounts for temporary files
 - **Unified Data Path**: Hardlink-compatible directory structure
 - **Resource Limits**: CPU/memory constraints for all services

 ## DO NOT
 - Use 'latest' tags in production
 - Expose services directly without reverse proxy
 - Store secrets in environment variables
 - Use default bridge network
 - Run containers as root user