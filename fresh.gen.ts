// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_groupId_userId_ from "./routes/[groupId]/[userId].tsx";
import * as $_groupId_index from "./routes/[groupId]/index.tsx";
import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";

import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/[groupId]/[userId].tsx": $_groupId_userId_,
    "./routes/[groupId]/index.tsx": $_groupId_index,
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
  },
  islands: {},
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
