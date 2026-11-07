#!/bin/bash

# mpd and icecast2 complain if these directories are not present at startup, this is where they store logs and such
mkdir -p /radiosa/socks/nowPlaying /radiosa/.mpd /radiosa/.icecast/logs

chown -R icecast2:icecast /radiosa/.icecast
chmod -R 750 /radiosa/.icecast
chown -R mpd:mpd /radiosa/.mpd
chmod -R 750 /radiosa/.mpd
chown -R mpd:mpd /radiosa/socks
chmod -R 770 /radiosa/socks  # group access so the unprivileged 'radiosa' user (in group 'mpd') can reach the control sockets
chown -R radiosa /radiosa/config  # update-mpd-config.mjs, run as 'radiosa', needs to write per-station .conf files here

run_as_radiosa() {
    su -p -s /bin/sh radiosa -c "$1"
}

export ENABLED_STATIONS=$ENABLED_STATIONS
export HOSTNAME=$HOSTNAME
export DISPLAY_ADMIN=$DISPLAY_ADMIN
export ADMIN_ACC=$ADMIN_ACC
export ICECAST_ADMIN_PASS=$ICECAST_ADMIN_PASS
export ICECAST_RELAY_PASS=$ICECAST_RELAY_PASS
export ICECAST_SOURCE_PASS=$ICECAST_SOURCE_PASS

cd /radiosa/scripts

run_as_radiosa "node /radiosa/scripts/write-enabled-stations-array.mjs"
/radiosa/scripts/update-icecast-config.sh

# This launches Icecast using the custom config
icecast2 -c /radiosa/config/icecast.xml &
echo "Icecast launched successfully"

run_as_radiosa "node /radiosa/scripts/now-playing-server.mjs" &
echo "Now-playing HTTP server launched successfully"
echo The following stations are enabled: $ENABLED_STATIONS.

IFS=', ' read -r -a ENABLED_STATIONS_ARRAY <<< "$ENABLED_STATIONS"
for CHANNEL_ALIAS in "${ENABLED_STATIONS_ARRAY[@]}"
do
    mkdir /radiosa/.mpd/$CHANNEL_ALIAS
    chown -R mpd:mpd /radiosa/.mpd/$CHANNEL_ALIAS
    chmod -R 750 /radiosa/.mpd/$CHANNEL_ALIAS

    run_as_radiosa "CHANNEL_ALIAS=$CHANNEL_ALIAS node /radiosa/scripts/update-mpd-config.mjs"

    mpd /radiosa/config/$CHANNEL_ALIAS.conf

    run_as_radiosa "CHANNEL_ALIAS=$CHANNEL_ALIAS node /radiosa/scripts/control-mpd-playback.mjs" &
done

tail -f /dev/null