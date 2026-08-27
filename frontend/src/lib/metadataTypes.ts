interface AudioFile {
    path: string;
    durationSamples: string;
}

interface SongEntry {
    intros: AudioFile[];
    mid: AudioFile;
    outros: AudioFile[];
}

interface WeatherEntry {
    Sunny?: AudioFile[];
    Rain?: AudioFile[];
    Fog?: AudioFile[];
    Smog?: AudioFile[];
    Storm?: AudioFile[];
}

interface TimeOfDayEntry {
    Morning?: AudioFile[];
    Evening?: AudioFile[];
    Night?: AudioFile[];
}

interface StationIdentity {
    alias: string;
    stationName: string;
    folder: string;
    genre: string;
    location: string;
    locationReal: string;
    host: string;
    latitude: string;
    longitude: string;
    logsColor: string;
}

interface MusicStationContent {
    Songs: SongEntry[];
    Callers?: AudioFile[];
    DJ: AudioFile[];
    ID?: AudioFile[];
    Weather?: WeatherEntry;
    "Time of Day": TimeOfDayEntry;
    "Bridge Announcement": AudioFile[];
}

type ShowSegment = AudioFile[];

interface TalkStationContent {
    Show: ShowSegment[];
    ID: AudioFile[];
    Advert: AudioFile[];
}

interface MusicStation {
    identity: StationIdentity;
    content: MusicStationContent;
}

interface TalkStation {
    identity: StationIdentity;
    content: TalkStationContent;
}

type RadioStation = MusicStation | TalkStation;
type RadioStationContent = MusicStationContent | TalkStationContent

type RadioStationNames = "bouncefm" | "csr" | "kdst" | "kjah" | "krose" | "mastersounds" | "playbackfm" | "radiols" | "radiox" | "sfur" | "wctr"

interface RadioStations {
    bouncefm: MusicStation;
    csr: MusicStation;
    kdst: MusicStation;
    kjah: MusicStation;
    krose: MusicStation;
    mastersounds: MusicStation;
    playbackfm: MusicStation;
    radiols: MusicStation;
    radiox: MusicStation;
    sfur: MusicStation;
    wctr: TalkStation;
}

export type {
    AudioFile,
    SongEntry,
    WeatherEntry,
    TimeOfDayEntry,
    StationIdentity,
    MusicStationContent,
    ShowSegment,
    TalkStationContent,
    MusicStation,
    TalkStation,
    RadioStation,
    RadioStationContent,
    RadioStations
};