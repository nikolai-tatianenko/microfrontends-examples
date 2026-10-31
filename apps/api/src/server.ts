import { createServer } from "node:http";
import { createApp } from "./app";

const port = Number(process.env.PORT ?? 4000);
const yoga = createApp();

const server = createServer((req, res) => {
  if (req.url === "/healthz") {
    res.writeHead(200, { "content-type": "text/plain" }).end("ok");
    return;
  }
  yoga(req, res);
});

server.listen(port, () =>
  console.log(`GraphQL API on http://localhost:${port}/graphql`),
);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
