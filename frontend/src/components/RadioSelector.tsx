import allStations from "@/lib/allStations";
import { navigate } from 'astro:transitions/client';

export default function RadioSelector() {
    return <div
        className="flex flex-col items-center justify-center sm:flex-row gap-4"
    >
        {
            allStations.map((station) => (
                <button
                    key={station}
                    className="w-40 aspect-square rounded-full p-8 hover:cursor-pointer hover:bg-gray-900"
                    onClick={() => {
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