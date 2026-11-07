import allStations from "@/lib/allStations"
import metadata from "@/lib/gta-sa-radio-metadata.json" with {type: "json"}
import { useEffect, useRef, useState } from "react"
import { VolumeBar } from "@/components/Player";

const stations = Object.values(metadata).map((station) => ({
    name: station.identity.stationName,
    alias: station.identity.alias,
    categories: (() => {
        let categories = new Set(Object.keys(station.content));
        if (categories.delete("Songs")) {
            categories.add("Songs (Intro)");
            categories.add("Songs (Outro)")
        }
        return [...categories];
    })()
}))

export default function DemoWidget() {
    const [audioSource, setAudioSource] = useState<string>()
    const [selectedStation, setSelectedStation] = useState("");
    const [categoriesShown, setCategoriesShown] = useState<string[]>([])
    const [volume, setVolume] = useState(8);
    const audioPlayerRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioPlayerRef.current) audioPlayerRef.current.volume = ((volume) / 16)
    }, [volume])
    useEffect(() => {
        if (!audioPlayerRef.current || !audioSource) return;
        audioPlayerRef.current.pause()
        audioPlayerRef.current.load();
        audioPlayerRef.current.play().catch()
    }, [audioSource]);
    const stopPlaying = () => {
        if (audioPlayerRef.current) audioPlayerRef.current.pause();
        setAudioSource(undefined)
    }
    return <div className="border-2 border-dashed p-4">

        <div className="grid grid-cols-[max-content] gap-2">
            <select
                className="py-1"
                autoComplete="off"
                value={selectedStation}
                onChange={(e) => {
                    setSelectedStation(e.target.value)
                    setCategoriesShown(stations.filter(({ alias }) => (alias === e.target.value))[0].categories)
                    stopPlaying()
                }}
            >
                <option value="" disabled> Please select a radio station</option>
                {stations.map(({ name, alias }) => (<option key={alias} value={alias}>{name}</option>))}
            </select>
            {
                selectedStation && <>
                    <div className="flex items-baseline gap-8">
                        <div>VOLUME:</div>
                        <VolumeBar volume={volume} setVolume={setVolume} className="w-64" />
                    </div>
                    <button className="border"
                        onClick={stopPlaying}
                    >
                        STOP
                    </button>
                </>
            }
        </div>

        {
            selectedStation && <>
                <h4>Play a random example of ______</h4>
                <div className="flex gap-2">
                    {
                        categoriesShown.map((category) => (
                            <button
                                onClick={() => {
                                    const params = new URLSearchParams({
                                        station: selectedStation,
                                        category,
                                        _: Date.now().toString()
                                    }).toString()
                                    const src = (`/api/get-random-track-from-category?${params}`)
                                    setAudioSource(src)
                                }}
                                key={category}
                                className="border px-4"
                            >
                                {category}
                            </button>
                        ))
                    }
                </div>
                <audio src={audioSource} ref={audioPlayerRef} ></audio>
            </>
        }
    </div>
}