import { useEffect, useRef, useState } from "react";
import type React from "react";
import type { StationIdentity } from "@/lib/metadataTypes";
import { twMerge } from "tailwind-merge";
import effectMenuSelect from "@/assets/menu/menu_select.wav";
import staticClip1 from "@/assets/radio-static/1.wav";
import staticClip2 from "@/assets/radio-static/2.wav";
import playEffect from "@/lib/playEffect";
import { UserCounter } from "@/components/UserCounter";

const STATIC_CLIPS = [staticClip1, staticClip2];

export default function Player({
  stationIdentity,
}: {
  stationIdentity: StationIdentity;
}) {
  const [volume, setVolume] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  const playerRef = useRef<HTMLAudioElement>(null);
  const radioStaticRef = useRef<HTMLAudioElement>(null);
  const allowSetSourcesRef = useRef(true);

  const station = stationIdentity.alias;
  const playerVolume = volume / 16;
  const staticVolume = playerVolume / 2;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("volume");
      if (stored !== null) setVolume(Number(stored));
    } catch {
      // localStorage unavailable; keep the default.
    }
  }, []);

  useEffect(() => {
    if (playerRef.current) playerRef.current.volume = playerVolume;
    if (radioStaticRef.current) radioStaticRef.current.volume = staticVolume;
  }, [playerVolume, staticVolume]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isPaused) {
      player.pause();
    } else if (player.paused) {
      syncSources();
      player.play().catch(() => { });
    }
  }, [isPaused]);

  function setSources() {
    const player = playerRef.current;
    if (!player) return;
    const nocache = Date.now();
    const mp3 = `/api/radio?format=mp3&station=${station}&nocache=${nocache}`;
    const ogg = `/api/radio?format=ogg&station=${station}&nocache=${nocache}`;
    if (player.canPlayType("audio/mpeg")) {
      player.setAttribute("src", mp3);
    } else if (player.canPlayType("audio/ogg")) {
      player.setAttribute("src", ogg);
    }
  }

  function syncSources() {
    if (!allowSetSourcesRef.current) return;
    setSources();
    allowSetSourcesRef.current = false;
    setTimeout(() => {
      allowSetSourcesRef.current = true;
    }, 2000);
  }

  useEffect(() => {
    const player = playerRef.current;
    const radioStatic = radioStaticRef.current;
    if (!player || !radioStatic) return;

    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("pause", () =>
        setIsPaused(true),
      );
      navigator.mediaSession.setActionHandler("play", () =>
        setIsPaused(false),
      );
    }

    const playStatic = async () => {
      const clip =
        STATIC_CLIPS[Math.floor(Math.random() * STATIC_CLIPS.length)];
      radioStatic.src = clip;
      try {
        await radioStatic.play();
        await new Promise<void>((resolve) => {
          radioStatic.onended = () => resolve();
        });
      } catch {
        // Autoplay was blocked; skip the static intro.
      }
      await player.play().catch(() => { });
    };

    syncSources();
    playStatic();
  }, []);
  return (
    <div className="flex flex-col justify-center items-center">
      <button className="hover:cursor-pointer" onClick={() => {
        const player = playerRef.current;
        if (!player) return;
        if (player.paused) {
          syncSources();
          player.play().catch(() => { });
        } else {
          player.pause();
        }
      }}>
        <img
          className={`w-64 ${isPaused ? "grayscale" : ""}`}
          src={`/assets/logos/${stationIdentity.alias}.webp`}
          alt={`${stationIdentity.stationName} Logo`}
        />
      </button>
      <InfoSection>
        <UserCounter
          station={station}
          label={(count) => `${count} LISTENING WITH YOU`}
        />
      </InfoSection>
      <InfoSection>
        <DisplayCurrentTrack stationIdentity={stationIdentity} />
      </InfoSection>

      <InfoSection>
        <DisplayStationInfo genre={stationIdentity.genre} host={stationIdentity.host}></DisplayStationInfo>
      </InfoSection>
      <div className="flex flex-col lg:flex-row justify-between items-center lg:items-baseline my-8 md:w-3xl">
        <p className="text-2xl">VOLUME</p>
        <VolumeBar volume={volume} setVolume={setVolume} />
      </div>
      <audio
        ref={playerRef}
        preload="auto"
        onPlay={() => setIsPaused(false)}
        onPause={() => setIsPaused(true)}
      />
      <audio ref={radioStaticRef} preload="auto" />
    </div>
  );
}

function useNowPlaying(station: string) {
  const [nowPlaying, setNowPlaying] = useState({
    path: "",
    title: "",
    artist: "",
  });

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/now-playing/stream?station=${station}`,
    );
    let delayId: ReturnType<typeof setTimeout>;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        clearTimeout(delayId);
        // The audio stream itself lags behind MPD's reported position, so
        // delay the metadata update to stay in sync with what's audible.
        delayId = setTimeout(() => setNowPlaying(data.nowPlaying), 2000);
      } catch (error) {
        console.error("Failed to parse Now-Playing data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Now-Playing stream error:", error);
    };

    return () => {
      eventSource.close();
      clearTimeout(delayId);
    };
  }, [station]);

  const isSong = ["Intro", "Mid", "Outro"].some((suffix) =>
    nowPlaying.path.includes(suffix),
  );

  return { nowPlaying, isSong };
}

function DisplayCurrentTrack({
  stationIdentity,
}: {
  stationIdentity: StationIdentity;
}) {
  const { nowPlaying, isSong } = useNowPlaying(stationIdentity.alias);
  const { stationName, alias } = stationIdentity;

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: isSong ? nowPlaying.title : "BREAK",
      artist: isSong ? nowPlaying.artist : "",
      album: stationName,
      artwork: [{ src: `/assets/logos/${alias}.webp` }],
    });
  }, [nowPlaying, isSong, stationName, alias]);

  return (
    <>
      <h1 className="text-2xl">{isSong ? "NOW PLAYING" : "BREAK"}</h1>
      {isSong && (
        <>
          <DisplayInfo>
            <p>ARTIST</p>
            <p>{nowPlaying.artist}</p>
          </DisplayInfo>
          <DisplayInfo>
            <p>SONG</p>
            <p>{nowPlaying.title}</p>
          </DisplayInfo>
        </>
      )}
    </>
  );
}

function DisplayStationInfo({ genre, host }: { genre: string; host: string }) {
  return <><DisplayInfo>
    <p>GENRE</p>
    <p>{genre}</p>
  </DisplayInfo>
    <DisplayInfo>
      <p>HOST</p>
      <p>{host}</p>
    </DisplayInfo></>;
}

function InfoSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-center items-center my-4 w-full max-w-2xl">
      {children}
    </div>
  );
}

function DisplayInfo({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left w-full gap-1 md:gap-8 [&>p:first-child]:shrink-0 [&>p:last-child]:min-w-0 [&>p:last-child]:wrap-break-word md:[&>p:last-child]:text-right">
      {children}
    </div>
  );
}

export function VolumeBar({
  volume,
  setVolume,
  className,
}: {
  volume: number;
  setVolume: (volume: number) => void;
  className?: string;
}) {
  const ACTIVE_COLOR = "#accbf1";
  const PASSIVE_COLOR = "#4a5a6b";

  const BAR_COUNT = 16;
  const BAR_WIDTH = 12;
  const BAR_GAP = 13;
  const BASE_HEIGHT = 10;
  const HEIGHT_STEP = 3;

  const VIEW_W =
    BAR_COUNT * BAR_WIDTH + (BAR_COUNT - 1) * BAR_GAP + BAR_GAP + BAR_WIDTH;
  const VIEW_H = BASE_HEIGHT + (BAR_COUNT - 1) * HEIGHT_STEP;

  const pendingVolumeEffectRef = useRef(false);

  function playVolumeEffect(vol: number) {
    playEffect(effectMenuSelect, vol / 16)
  }

  function markPendingVolumeEffect() {
    pendingVolumeEffectRef.current = true;
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.repeat) return;
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
    ) {
      markPendingVolumeEffect();
    }
  }
  return (
    <div
      className={twMerge(
        "relative w-full max-w-[387px] touch-none has-focus-visible:ring-2 has-focus-visible:ring-sky-300",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="block w-full h-auto"
        aria-hidden="true"
      >
        {Array.from({ length: BAR_COUNT }, (_, index) => {
          const barHeight = BASE_HEIGHT + index * HEIGHT_STEP;
          return (
            <rect
              key={index + 1}
              x={(index + 1) * (BAR_WIDTH + BAR_GAP)}
              y={VIEW_H - barHeight}
              width={BAR_WIDTH}
              height={barHeight}
              fill={index < volume ? ACTIVE_COLOR : PASSIVE_COLOR}
            />
          );
        })}
      </svg>

      <input
        className="absolute -inset-y-3 left-0 w-full cursor-pointer opacity-0 m-0"
        type="range"
        id="volume"
        name="volume"
        aria-label="Volume"
        min={0}
        max={BAR_COUNT}
        value={volume}
        onMouseDown={markPendingVolumeEffect}
        onKeyDown={handleKeyDown}
        onTouchStart={markPendingVolumeEffect}
        onChange={(e) => {
          const v = e.target.valueAsNumber
          setVolume(v)
          try { localStorage.setItem("volume", String(v)) } catch { }
          if (pendingVolumeEffectRef.current) {
            pendingVolumeEffectRef.current = false;
            playVolumeEffect(v);
          }
        }}
      />
    </div>
  );
}
