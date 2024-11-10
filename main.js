import { Application } from "@oak/oak";
import router from "./routes/api.js";
import { oakCors } from "@tajpouria/cors";

const app = new Application();

app.use(oakCors({
    origin: "*",  // Allow requests from any origin (use carefully in production)
  }));
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
