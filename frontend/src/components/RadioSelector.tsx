import allStations from "@/lib/allStations";
import { navigate } from 'astro:transitions/client';
import effectMenuHover from "@/assets/menu/menu_hover.wav"
import effectMenuSelect from "@/assets/menu/menu_select.wav"

export default function RadioSelector() {
    function playMenu(effect: string){
        let audio: HTMLAudioElement | null = new Audio(effect)
        audio.play().then(()=>{audio=null}).catch((e)=>{})
    }
    return <div
        className="flex flex-wrap justify-center gap-4 sm:mx-16"
    >
        {
            allStations.map((station) => (
                <button
                onMouseEnter={()=>{
                    playMenu(effectMenuHover)
                }}
                    key={station}
                    className="w-48 sm:w-64 aspect-square rounded-full p-8 hover:cursor-pointer hover:bg-gray-900"
                    onClick={() => {
                        playMenu(effectMenuSelect)
                        navigate(`/${station}`);
                    }}
                >
                    <img
                        className="aspect-square"
                        src={`/assets/logos/${station}.webp`}
                    />
                </button>
            ))
        }
    </div>
}