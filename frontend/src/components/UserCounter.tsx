import { useEffect, useState } from "react";

export function GlobalUserCounter() {
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const abortController = new AbortController();

    async function connectStream() {
      await fetch("/api/get-user-count", {
        signal: abortController.signal,
      })
        .then((response) => response.body)
        .then(async (rb) => {
          if (!rb) return;
          const reader = rb.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const rawJson = line.replace("data: ", "").trim();
                const parsed = JSON.parse(rawJson);
                setActiveUsers(parsed.count);
              }
            }
          }
        })
        .catch((error) => {
          if ((error as Error).name !== "AbortError") {
            console.error("Stream encountered an error:", error);
          }
        });
    }
    connectStream();
    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <div>
      <h1 className="whitespace-nowrap text-xl lg:text-3xl">
        {activeUsers} {"ACTIVE USER" + (activeUsers === 1 ? "" : "S")}
      </h1>
    </div>
  );
}
