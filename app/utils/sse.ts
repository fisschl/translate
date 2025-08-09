export class EventSourceParserStream extends TransformStream<string, Record<string, any>> {
  constructor() {
    super({
      transform: (chunk, controller) => {
        const lines = chunk.split("\n\n").map((line) => line.trim());
        for (const line of lines) {
          const prefix = "data:";
          if (!line.startsWith(prefix)) continue;
          const content = line.slice(prefix.length).trim();
          if (content === "[DONE]") return;
          try {
            const json = JSON.parse(content);
            controller.enqueue(json);
          } catch {
            continue;
          }
        }
      },
    });
  }
}
