import { useState } from "react";

const ACTIVE_COLOR = "#accbf1";
const PASSIVE_COLOR = "#4a5a6b";
const VOLUME_RANGE = [...Array(16).keys()];
export default function VolumeBar() {
  const [volume, setVolume] = useState(9);
  return (
    <div className="flex gap-[13px] items-end">
      {VOLUME_RANGE.map((_, index) => (
        <Rectangle
          key={index}
          height={index}
          color={index < volume ? ACTIVE_COLOR : PASSIVE_COLOR}
        />
      ))}
    </div>
  );
}

function Rectangle({
  height,
  color,
  className = "",
}: {
  height: number;
  color: string;
  className?: string;
}) {
  const barHeight = 10 + height * 3;
  return (
    <svg className={className} width={12} height={barHeight}>
      <rect width="12" height={barHeight} fill={color} />
    </svg>
  );
}
