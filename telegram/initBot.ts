import { BOT_TOKEN } from "../env.ts";
import handleError from "../utils/handleError.ts";
import { API_CONSTANTS, Bot } from "grammy/mod.ts";
import { run, sequentialize } from "grammy-runner";
import saveMessagesInfo from "./saveMessagesInfo.ts";
import genericsHandler from "./composers/genericsHandler.ts";
import pointsHandler from "./composers/pointsHandler/pointsHandler.ts";
import commandsHandler from "./composers/commandsHandler/commandsHandler.ts";

const bot = new Bot(BOT_TOKEN);
export default bot;

// https://grammy.dev/plugins/runner#sequential-processing-where-necessary
bot.use(sequentialize((ctx) => [ctx.chat?.id.toString(), ctx.from?.id.toString()].filter(Boolean) as string[]));

// Saves who sent a message in a group
bot.on("message", saveMessagesInfo);

bot.use(pointsHandler);
bot.use(commandsHandler);

bot.use(genericsHandler);

bot.catch(({ ctx, error }) => {
  console.error(`Error while handling update ${ctx.update.update_id}:`, error);
  ctx.reply("There was an error.");
  handleError(error);
});

run(bot, { runner: { fetch: { allowed_updates: API_CONSTANTS.ALL_UPDATE_TYPES } } });

console.log("Bot is running.");
