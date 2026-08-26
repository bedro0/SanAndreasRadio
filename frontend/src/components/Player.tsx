import { useRef, useState } from "react";
import VolumeBar from "./VolumeBar";
import { type typeStationIdentity } from "@/lib/stationMetadata";

export default function Player({ stationIdentity }: { stationIdentity: typeStationIdentity }) {
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