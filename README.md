# Radio San Andreas

This repo lets you listen to the in-game radio stations from Grand Theft Auto: San Andreas over the web, in real life. A backend container drives Icecast/MPD per-station streams, and an Astro + React frontend serves the player UI, proxying audio and metadata through to the backend.

## Prerequisite: export the station audio

You need the station audio exported from the game with the [San Andreas Audio Toolkit (SAAT)](https://github.com/bedro0/San-Andreas-Audio-Toolkit), using its `-r` (metadata) export mode and the `metadata-full.ini` file that ships with it. The output folder will contain one subfolder per station (`Adverts`, `Bounce FM`, `CSR`, `K-DST`, `K-JAH`, `KROSE`, `Master Sounds`, `Playback FM`, `Radio Los Santos`, `Radio X`, `SFUR`, `WCTR`) with descriptively named `.ogg` files. Use that folder as `MUSIC_PATH` below.

Don't use the plain `-e` export: it names files `Track_001.ogg` etc., which the backend won't find. See SAAT's [MANUAL.txt](https://github.com/bedro0/San-Andreas-Audio-Toolkit/blob/main/MANUAL.txt) for full usage.

### Windows

1. Download SAAT (clone it, or use Code ==> Download ZIP and extract it).
2. Open a Command Prompt and `cd` into the toolkit folder (the one containing `saat_stream.exe` and `metadata-full.ini`).
3. Run the export. Adjust `GTA` to your GTA San Andreas install folder and the last-but-one argument to where you want the audio:

   ```bat
   set GTA=C:\Program Files\Rockstar Games\GTA San Andreas
   saat_stream.exe -r "%GTA%\audio\streams\ADVERTS" "%GTA%\audio\streams\CH" "%GTA%\audio\streams\CO" "%GTA%\audio\streams\CR" "%GTA%\audio\streams\DS" "%GTA%\audio\streams\HC" "%GTA%\audio\streams\MH" "%GTA%\audio\streams\MR" "%GTA%\audio\streams\NJ" "%GTA%\audio\streams\RE" "%GTA%\audio\streams\RG" "%GTA%\audio\streams\TK" C:\SanAndreasRadio\music metadata-full.ini
   ```

### Linux (and other POSIX systems)

You can either use the prebuilt x86-64 binary or build SAAT from source.

**Prebuilt binary (x86-64 Linux):** download `saat-linux-x86_64.tar.gz` from the [v1.10-linux release](https://github.com/bedro0/San-Andreas-Audio-Toolkit/releases/tag/v1.10-linux) and extract it. It contains `saat_stream`, `saat_sfx` and `metadata-full.ini`:

```sh
mkdir saat && tar -xzf saat-linux-x86_64.tar.gz -C saat
cd saat
```

The binaries link dynamically against libogg, libvorbis and libsndfile, so install those if they're missing (on Debian/Ubuntu: `sudo apt install libogg0 libvorbis0a libsndfile1`). It's built on a current Ubuntu, so on older distros build from source instead.

**Build from source:** the POSIX fixes live on the `linux-build` branch (`main` is the unmodified original release and won't build correctly on Linux). You need `make`, a C/C++ compiler, and the libogg, libvorbis and libsndfile development headers:

```sh
sudo apt install build-essential libogg-dev libvorbis-dev libsndfile1-dev   # Debian/Ubuntu
# sudo dnf install gcc-c++ make libogg-devel libvorbis-devel libsndfile-devel  # Fedora
# sudo pacman -S base-devel libogg libvorbis libsndfile                        # Arch

git clone -b linux-build https://github.com/bedro0/San-Andreas-Audio-Toolkit.git
cd San-Andreas-Audio-Toolkit
make -C src PLATFORM=posix
cp src/saat_stream src/saat_sfx .
```

**Run the export** from the folder containing `saat_stream` and `metadata-full.ini`. Set `GTA` to your GTA San Andreas install folder (for example, a Steam/Proton install or a copy of the game's files) and the last-but-one argument to where you want the audio:

```sh
GTA="$HOME/path/to/GTA San Andreas"
mkdir -p ~/SanAndreasRadio/music
./saat_stream -r "$GTA"/audio/streams/{ADVERTS,CH,CO,CR,DS,HC,MH,MR,NJ,RE,RG,TK} ~/SanAndreasRadio/music metadata-full.ini
```

Linux file names are case-sensitive, so check that the stream files under `audio/streams` match the upper-case names above.

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
