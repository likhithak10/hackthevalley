import dotenv from "dotenv";
dotenv.config({ path: new URL("./.env", import.meta.url) });

const { createApiServer } = await import("./http-app.mjs");
const { PORT = "3000" } = process.env;
createApiServer().listen(Number(PORT), () => {
  console.log(`[EcoToken API] http://localhost:${PORT}`);
});
