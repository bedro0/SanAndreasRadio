import { useRef, useState } from "react";
import VolumeBar from "./VolumeBar";

export default function Player() {
    const [volume, setVolume] = useState(2);
    return <div>
        <VolumeBar volume={volume} setVolume={setVolume} />

    </div>
}