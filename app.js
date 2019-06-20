const Telegraf = require('telegraf');
const Model = require('./model');

// checking for token
if(process.env.BOT_TOKEN == undefined){
  console.log("No Telegram bot token set.");
  process.exit();
}

// setting up bot
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.telegram.getMe().then(botInfo => {
  bot.options.username = botInfo.username;
});

// start command
bot.start(ctx => {
  console.log("Bot started.");
  
  let message = 'Hello! I can help keep track of scores for you!\n';
  message += 'For available commands, type /help.';
  
  return ctx.reply(message);
});

// help command
bot.help(ctx => {
  console.log("Help requested.");
  
  let message = 'Add [score] to [Id].\n';
  message += '/addscore [Id] [score]\n';
  message += '/t [Id] [score]\n';
  message += '\n';
  message += 'Add [userId] as admin. User can change scores and add more admins.\n';
  message += '/adduser [userId]\n';
  message += '\n';
  message += 'Display score.\n';
  message += '/displayscore\n';
  message += '/ds\n';
  message += '\n';
  message += 'Get user ID.\n';
  message += '/who';
  
  return ctx.reply(message);
});

// addscore command
bot.command(['addscore', 't'], async ctx => {
  console.log("Adding score.");
  
  const args = ctx.message.text.split(' ');
  const teamId = args[1];
  const score = Number(args[2]);
  const userId = ctx.from.id;
 
  try {
    const res = await Model.addTeamScore(teamId, score, userId);
    const newScore = res.team.score;
    const message = `*${res.team.name}* has *${newScore}* points.`;
    return ctx.telegram.sendMessage(ctx.chat.id, message, { parse_mode: 'Markdown', reply_to_message_id: ctx.message.message_id });
  } catch (err) {
    return ctx.reply(err);
  }
});

// adduser command
bot.command('adduser', async ctx => {
  console.log("Adding another user.");
  
  const args = ctx.message.text.split(' ');
  const targetId = Number(args[1]);
  const userId = ctx.from.id;
  
  try {
    const newScore = await Model.addUser(targetId, userId);
    const message = `User ${targetId} has been added`;
    return ctx.reply(message);
  } catch (err) {
    return ctx.reply(err);
  }
});

// displayscore command
bot.command(['displayscore', 'ds'], async ctx => {
  console.log("Getting score.");
  
  const teamsModel = await Model.getTeamsModel();
  let message = "Current score: \n";
  
  teamsModel.forEach(function (team) {
    message += `${team.name} (${team.id}) - *${team.score}*\n`;
  });

  return ctx.replyWithMarkdown(message);
});

// who command
bot.command('who', async ctx => {
  console.log("Getting user ID.");
  return ctx.replyWithMarkdown(`${ctx.from.first_name} your ID is \`${ctx.from.id}\``);
});

// start bot
bot.startPolling();
console.log("Bot polling.");