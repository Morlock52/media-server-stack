 #!/usr/bin/env bash
 set -euo pipefail

 echo "Checking service health endpoints..."

 # Example health checks (customize URLs and ports as needed)
 curl -f http://localhost:8096/health || exit 1
 curl -f http://localhost:8989/ping || exit 1
 curl -f http://localhost:7878/ping || exit 1

 echo "All health checks passed."