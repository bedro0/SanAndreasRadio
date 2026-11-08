# Radio San Andreas

This repo lets you listen to the in-game radio stations from Grand Theft Auto: San Andreas over the web, in real life. A backend container drives Icecast/MPD per-station streams, and an Astro + React frontend serves the player UI, proxying audio and metadata through to the backend.

Prerequisite: you need the station audio exported from the game.

1. Download [San Andreas Audio Toolkit](https://github.com/bedro0/Project-gRadio/raw/main/San%20Andreas%20Audio%20Toolkit.7z).
2. Extract the archive and open SaatGuiFrontend.exe inside the folder named Alci_s_SAAT_GUI_FrontEnd_1.0.
3. Click File ==> Set Working Directory, to choose the folder where all the Audio files will be exported.
4. Click File ==> Set GTA Directory, and choose the folder with original GTA San Andreas installed.
5. To export radio tracks, simply double click the labels under the tab labeled "Archiv". The files are simply going to appear in the working directory. This project now supports all channels from the game.

## Running it

This is a two-service [Docker Compose](https://docs.docker.com/compose/) setup: `backend` (Icecast + MPD + Node control scripts) and `frontend` (the Astro/React site). Ready-made images for both are published to GHCR on every push to `main`, so you don't need to build anything locally.

1. Clone the repo.
2. Create a `.env` file in the repo root pointing at the folder of exported audio (`MUSIC_PATH=/path/to/exported/audio`).
3. Pull the latest images and start everything:

   ```sh
   docker compose pull
   docker compose up -d
   ```

4. Go to `http://localhost:4321`.

The backend's Icecast port is not published to the host — the frontend proxies audio (`/api/radio`) and now-playing metadata (`/api/now-playing`) to it over the internal Compose network, so port 4321 is the only thing you need exposed.

If you'd rather build the images yourself (e.g. to test local changes to `backend/` or `frontend/`), run `docker compose up --build` instead — Compose will build from source and use that image in place of the pulled one.

### Dev mode

`compose.dev.yml` is an overlay that builds each service's `dev` stage instead of `prod`: the frontend runs Astro's dev server (with hot reload) instead of a production build, and the backend image gets `vim`/`mpc`/`tmux` installed for debugging inside the container.

```sh
docker compose -f compose.yml -f compose.dev.yml up --build
```

**Environmental Variables (Only For Advanced Users):**

| Variable | Purpose | Default Value |
| - | - | - |
| MUSIC_PATH | Host path to the audio exported from the game, mounted read-only into both containers | (required, no default) |
| HOSTNAME | Hostname for Icecast. (As far as I understand, it's only to display on the Icecast WebUI.) | localhost |
| DISPLAY_ADMIN | Display name for an administrator on Icecast version page | admin |
| ADMIN_USER | Username for administrator login | admin |
| ENABLED_STATIONS | Enabled Radio Stations | "bouncefm, csr, kdst, kjah, krose, mastersounds, playbackfm, radiols, radiox, sfur, wctr" |
| ICECAST_SOURCE_PASS | Source Password for Icecast (ShoutCast) stream | (Random string of 16 CAPITAL alphanumeric characters) |
| ICECAST_RELAY_PASS | Relay Password for Icecast | (Random string of 16 CAPITAL alphanumeric characters) |
| ICECAST_ADMIN_PASS | Administrator password for Icecast web login | (Random string of 16 CAPITAL alphanumeric characters) |

## Project structure

```text
backend/     Icecast + MPD, and the Node scripts that configure/control them per station
frontend/    Astro + React site: station player, now-playing display, live listener counts
```

The frontend is server-rendered (Node adapter) so it can proxy to the backend's internal-only services; station pages (`/[station]`) are prerendered at build time.

## Features

- Live playback of each station's Icecast stream, with a short static-noise sting on station switch.
- Live now-playing track info per station, pushed over Server-Sent Events from an MPD-backed metadata service.
- Live listener counts, both per-station and site-wide.
- An about page with a demo widget that plays a random clip from a chosen station/category without needing a live stream.

Additional Resources

[Icecast Documentation](https://icecast.org/docs/icecast-2.4.1/)

[MPD Documentation (Arch Wiki)](https://wiki.archlinux.org/title/Music_Player_Daemon)

[MPD Configuration (Fandom) - Adblock Recommended while browsing Fandom Website](https://mpd.fandom.com/wiki/Configuration)

[MPD Website](https://www.musicpd.org/)
