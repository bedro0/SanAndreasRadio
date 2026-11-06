import type { APIContext } from "astro";
import metadata from "@/lib/gta-sa-radio-metadata.json" with {type: "json"}
import fs from "fs/promises";
import Chance from "chance";
import allStations from "@/lib/allStations";
import type { AudioFile, MusicStationContent, RadioStationContent, RadioStations, SongEntry } from "@/lib/metadataTypes";

const chance = new Chance();

export async function GET({ url }: APIContext) {
    const category = url.searchParams.get("category");
    const station = url.searchParams.get("station");
    if (!station || !allStations.includes(station)) {
        return Response.json(
            { message: "Please ensure the station alias is correct and exists in the following list: bouncefm, csr, kdst, kjah, krose, mastersounds, playbackfm, radiols, radiox, sfur, wctr." },
            { status: 400 })
    }
    const stationContent: RadioStationContent = metadata[station as keyof RadioStations].content
    let categories = new Set(Object.keys(stationContent))
    if (categories.delete("Songs")) {
        categories.add("Songs (Intro)");
        categories.add("Songs (Outro)")
    }
    if (!category || !categories.has(category)) {
        console.log(category)
        return Response.json({ message: "Please make sure the category exists in the specified station." }, { status: 400 })
    }
    const randomTrack = await getRandomTrackFromCategory(stationContent, category).then(file => file.path).catch();
    const responseFile = await fs.readFile(`/home/bedro/Music/San Andreas/${randomTrack}`).catch();
    return new Response(responseFile, {
        headers: {
            "Content-Type": "audio/ogg"
        }
    });
}

async function getRandomTrackFromCategory(stationContent: RadioStationContent, category: string) {
    switch (category) {
        case "Songs (Intro)":
            const djIntros =
                (stationContent as MusicStationContent).Songs
                    .map((song) => (song.intros))
                    .flat()
                    .filter(intro => intro.path.includes("Intro DJ #"))
            return chance.pickone(djIntros)
        case "Songs (Outros)":
            const djOutros =
                (stationContent as MusicStationContent).Songs
                    .map((song) => (song.outros))
                    .flat()
                    .filter(outro => outro.path.includes("Intro DJ #"))
            return chance.pickone(djOutros)
        case "Weather":
            const weatherTracks = Object.values(((stationContent as MusicStationContent).Weather as Record<string, AudioFile[]>)).flat();
            return chance.pickone(weatherTracks);
        case "Time of Day":
            const todTracks = Object.values(((stationContent as MusicStationContent)["Time of Day"] as Record<string, AudioFile[]>)).flat();
            return chance.pickone(todTracks)
        default:
            return chance.pickone(stationContent[category as keyof RadioStationContent] ?? [])
    }

}