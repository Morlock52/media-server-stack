# GDrive Media Stack

This folder contains Docker Compose files ready to be copied to a Google Drive folder named **media**. Use these files if you want to keep your stack configuration in Google Drive for easy access across machines.

## Usage
1. Mount your Google Drive locally (via rclone or Drive for desktop).
2. Copy the contents of this `gdrive/media` directory into your Google Drive folder.
3. From the Google Drive folder, run:
   ```bash
   docker compose up -d
   ```
