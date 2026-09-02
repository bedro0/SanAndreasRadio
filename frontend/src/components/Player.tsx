import { useRef, useState } from "react";
import type { StationIdentity } from "@/lib/metadataTypes";
import { twMerge } from "tailwind-merge";
import effectMenuSelect from "@/assets/menu/menu_select.wav";

export default function Player({
  stationIdentity,
}: {
  stationIdentity: StationIdentity;
}) {
  const [volume, setVolume] = useState(8);
  return (
    <div className="flex flex-col justify-center items-center">
      <img
        className="w-64"
        src={`/assets/logos/${stationIdentity.alias}.webp`}
      ></img>
      {/* <InfoSection>
        <h1 className="text-2xl">NOW PLAYING</h1>
        <DisplayInfo>
          <p>ARTIST</p>
        </DisplayInfo>
        <DisplayInfo>
          <p>SONG</p>
          <span>Mammas Don’t Let Your Babies Grow Up to Be Cowboys</span>
        </DisplayInfo>
      </InfoSection>
      <InfoSection>
        <DisplayInfo>
          <p>GENRE</p>
          <p>{stationIdentity.genre}</p>
        </DisplayInfo>
        <DisplayInfo>
          <p>HOST</p>
          <p>{stationIdentity.host}</p>
        </DisplayInfo>
      </InfoSection> */}
      <div className="flex flex-col lg:flex-row justify-between items-center lg:items-baseline my-8 md:w-3xl">
        <p className="text-2xl">VOLUME</p>
        <VolumeBar volume={volume} setVolume={setVolume} />
      </div>
    </div>
  );
}

function DisplayCurrentTrack() {
  const [nowPlaying, setNowPlaying] = useState({ path: "" });
  let isSong = ["Intro", "Mid", "Outro"].some((suffix) =>
    nowPlaying.path.includes(suffix),
  );
  return <div></div>;
}

function DisplayStationInfo({ genre, host }: { genre: string; host: string }) {
  return <div></div>;
}

function InfoSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-center items-center my-8">
      {children}
    </div>
  );
}

function DisplayInfo({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between items-center text-center w-lg">
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

  function volumeChangeSoundEffect(event: React.KeyboardEvent | null) {
    function play() {
      const audio = new Audio(effectMenuSelect);
      audio.play().catch();
    }
    if (event === null) {
      play();
    } else {
      if (event.repeat) return;
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        play();
      }
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
        onMouseDown={() => volumeChangeSoundEffect(null)}
        onKeyDown={volumeChangeSoundEffect}
        onTouchStart={() => volumeChangeSoundEffect(null)}
        onChange={(e) => setVolume(e.target.valueAsNumber)}
      />
    </div>
  );
}
