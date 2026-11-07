import allStations from "@/lib/allStations";
import { navigate } from 'astro:transitions/client';
import effectMenuHover from "@/assets/menu/menu_hover.wav"
import effectMenuSelect from "@/assets/menu/menu_select.wav"
import playEffect from "@/lib/playEffect";

export default function RadioSelector() {
    function playMenu(effect: string) {
        let audio: HTMLAudioElement | null = new Audio(effect)
        audio.play().then(() => { audio = null }).catch((e) => { })
    }
    return <div
        className="flex flex-wrap justify-center gap-4 sm:mx-16"
    >
        {
            allStations.map((station) => (
                <a
                    href={`/${station}`}
                    onMouseEnter={() => {
                        playEffect(effectMenuHover, parseInt(localStorage.getItem("volume")!) / 32)
                    }}
                    key={station}
                    className="w-48 sm:w-64 aspect-square rounded-full p-8 hover:cursor-pointer hover:bg-gray-900"
                    onClick={(e) => {
                        e.preventDefault()
                        playMenu(effectMenuSelect)
                        navigate(`/${station}`);
                    }}
                >
                    <img
                        className="aspect-square"
                        src={`/assets/logos/${station}.webp`}
                    />
                </a>
            ))
        }
    </div>
}