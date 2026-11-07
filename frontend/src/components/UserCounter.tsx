import { useEffect, useState } from "react";

export function UserCounter({
  station,
  label,
}: {
  station?: string;
  label: (count: number) => string;
}) {
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const query = station ? `?station=${encodeURIComponent(station)}` : "";
    const eventSource = new EventSource(`/api/get-user-count${query}`);

    eventSource.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      setActiveUsers(parsed.count);
    };

    return () => {
      eventSource.close();
    };
  }, [station]);

  return (
    <div>
      <h1 className="whitespace-nowrap text-xl lg:text-3xl">
        {label(activeUsers)}
      </h1>
    </div>
  );
}
