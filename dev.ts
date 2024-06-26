#!/usr/bin/env -S deno run -A --watch=static/,routes/

import "preact/debug";
import "./crons/crons.ts";
import "./telegram/initBot.ts";
import "humanizer/toQuantity.ts";
import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

await dev(import.meta.url, "./main.ts", config);
