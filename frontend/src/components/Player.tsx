import { useRef, useState } from "react";
import type { StationIdentity } from "@/lib/metadataTypes";
import { twMerge } from "tailwind-merge";

export default function Player({ stationIdentity }: { stationIdentity: StationIdentity }) {
    const [volume, setVolume] = useState(8);
    return <div className="flex flex-col justify-center items-center">
        <img className="w-64" src={`/assets/logos/${stationIdentity.alias}.webp`}></img>
        <InfoSection>
            <h1 className="text-2xl">NOW PLAYING</h1>
            <DisplayInfo>
                <p>ARTIST</p>
            </DisplayInfo>
            <DisplayInfo>
                <p>SONG</p>
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
        </InfoSection>
        <div className="flex justify-between items-baseline my-8 w-3xl">
            <p className="text-2xl">VOLUME</p>
            <VolumeBar volume={volume} setVolume={setVolume} />
        </div>
    </div>
}

function InfoSection({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col justify-center items-center my-8">
        {children}
    </div>
}

function DisplayInfo({ children }: { children: React.ReactNode }) {
    return <div className="flex justify-between items-center w-md">
        {children}
    </div>
}

export function VolumeBar({ volume, setVolume, className }: {
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

    const VIEW_W = BAR_COUNT * BAR_WIDTH + (BAR_COUNT - 1) * BAR_GAP;
    const VIEW_H = BASE_HEIGHT + (BAR_COUNT - 1) * HEIGHT_STEP;

    return (
        <div className={
            twMerge("relative w-full max-w-[387px] touch-none rounded has-focus-visible:ring-2 has-focus-visible:ring-sky-300", className)
        }>
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
                            key={index}
                            x={index * (BAR_WIDTH + BAR_GAP)}
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
                min={1}
                max={BAR_COUNT}
                value={volume}
                onChange={(e) => setVolume(e.target.valueAsNumber)}
            />
        </div>
    );
}