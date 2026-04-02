import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUiDist from "swagger-ui-dist";

const router = express.Router();

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const projectRoot = path.resolve(currentDirectory, "../..");
const openApiSpecPath = path.join(projectRoot, "openapi.json");
const swaggerUiAssetsPath = swaggerUiDist.getAbsoluteFSPath();

const renderSwaggerUiHtml = () => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>WorkNest API Docs</title>
    <link rel="stylesheet" href="/docs/assets/swagger-ui.css" />
    <link rel="icon" type="image/png" href="/docs/assets/favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="/docs/assets/favicon-16x16.png" sizes="16x16" />
    <style>
      html {
        box-sizing: border-box;
        overflow-y: scroll;
      }

      *,
      *::before,
      *::after {
        box-sizing: inherit;
      }

      body {
        margin: 0;
        background: #f5f7fb;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/docs/assets/swagger-ui-bundle.js" defer></script>
    <script src="/docs/assets/swagger-ui-standalone-preset.js" defer></script>
    <script src="/docs/swagger-initializer.js" defer></script>
  </body>
</html>`;

router.get("/openapi.json", (req, res) => {
  res.sendFile(openApiSpecPath);
});

router.use(
  "/docs/assets",
  express.static(swaggerUiAssetsPath, {
    index: false,
    immutable: true,
    maxAge: "1d",
  }),
);

router.get("/docs/swagger-initializer.js", (req, res) => {
  res.type("application/javascript").send(`window.addEventListener("load", () => {
  window.ui = SwaggerUIBundle({
    url: "/openapi.json",
    dom_id: "#swagger-ui",
    deepLinking: true,
    displayRequestDuration: true,
    docExpansion: "list",
    persistAuthorization: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset,
    ],
    layout: "StandaloneLayout",
  });
});`);
});

router.get("/docs", (req, res) => {
  res.type("html").send(renderSwaggerUiHtml());
});

router.get("/docs/", (req, res) => {
  res.type("html").send(renderSwaggerUiHtml());
});

export default router;
