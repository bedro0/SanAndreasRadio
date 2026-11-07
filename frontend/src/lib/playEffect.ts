export default function playEffect(effectClip: string, volume: number) {
    const audio = new Audio(effectClip)
    audio.volume = Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : 1))
    audio.play().catch(() => { })
}