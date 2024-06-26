import { escapeHtml } from "escapeHtml";
import db from "../../../data/database.ts";
import { ReactionTypeEmoji } from "grammy/types.deno.ts";
import { Context, Filter, HearsContext } from "grammy/mod.ts";
import { changePoints, getPoints } from "../../../data/controllers/userPointsInGroupController.ts";

type Contexts = HearsContext<Context> | Filter<Context, "message:sticker"> | Filter<Context, "message_reaction">;

async function getUserId(ctx: Contexts): Promise<number | null> {
  if (ctx.message?.reply_to_message?.from?.id) return ctx.message?.reply_to_message?.from?.id;

  if (!ctx.update.message_reaction) return null;

  const userMessage = await db.userMessageId.findByPrimaryIndex("messageAndGroupId", [
    ctx.update.message_reaction.message_id,
    Math.abs(ctx.update.message_reaction.chat.id),
  ]);
  if (!userMessage) return null;

  return userMessage.value.userId;
}

async function getUserName(ctx: Contexts, userId: number): Promise<string | null> {
  if (ctx.message?.reply_to_message?.from?.first_name) return ctx.message.reply_to_message.from.first_name;

  if (!ctx.update.message_reaction) return "";

  const user = await db.userName.findByPrimaryIndex("userId", userId);
  if (!user) return null;

  return user.value.userName;
}

interface ExtraOptions {
  sendMessage?: boolean;
  byEmoji?: ReactionTypeEmoji["emoji"];
  replyTo?: number;
  /** These are the points that will show to be added or taken in the Telegram message */
  pointsToShow?: number;
}

export default async function handlePoints(
  ctx: Contexts,
  points: number,
  { sendMessage = true, byEmoji, replyTo, pointsToShow }: ExtraOptions = {}
) {
  const groupId = Math.abs(ctx.update.message_reaction?.chat.id ?? ctx.chat?.id ?? 0);
  if (!groupId) return;

  const userId = ctx.from!.id;
  const userName = escapeHtml(ctx.from!.first_name);

  const repliedToUserId = await getUserId(ctx);
  if (repliedToUserId === null) return;

  // Cannot give points to yourself
  if (userId === repliedToUserId) return;

  const repliedToMessageId = ctx.message?.reply_to_message?.message_id || ctx.update.message_reaction?.message_id;
  if (!repliedToMessageId) return;

  // Check if the user has already reacted to this message
  const reaction = await db.messageReaction.findByPrimaryIndex("messageFromIdAndGroupId", [
    repliedToMessageId,
    userId,
    groupId,
  ]);
  if (reaction) return;

  const repliedToPoints = await changePoints(groupId, repliedToUserId, points);

  if (sendMessage) {
    const repliedToUserName = await getUserName(ctx, repliedToUserId);
    if (repliedToUserName === null) return;

    const userPoints = await getPoints(groupId, userId);

    const res = await ctx.reply(
      `<b>${userName} (${userPoints})</b> le ${(pointsToShow ?? points) > 0 ? "aumentó" : "quitó"} ` +
        `${"punto".toQuantity(Math.abs(pointsToShow ?? points))} a ` +
        `<b>${escapeHtml(repliedToUserName)} (${repliedToPoints})</b>.`,
      { parse_mode: "HTML", ...(replyTo ? { reply_parameters: { message_id: replyTo } } : {}) }
    );

    await db.messageReaction.add({
      byEmoji,
      toUserId: repliedToUserId,
      botReplyId: res.message_id,
      messageFromIdAndGroupId: [repliedToMessageId, userId, groupId],
    });
  }
}
