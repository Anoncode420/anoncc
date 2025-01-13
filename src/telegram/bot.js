const { executeOneOperationOk, Logger, accpetedFormats, _sleep } = require('../../index');
const { Telegraf } = require('telegraf');
const { telegramBotToken, adminNamesForTelegramBot } = require('../../config');
const { messageHandler } = require('./message');

class TelegramBot extends Telegraf {
    constructor() {
        super(telegramBotToken);
        this.oplogger = Logger;
        this.botInfoClass = {};
        this.messageHandler = new messageHandler(this);
    }

    initializeCommands() {
        this.command('start', async (ctx) => {
            if (ctx.from.is_bot) return ctx.reply('Bots are not allowed to use this bot!');
            this.testCtx = ctx;
            return await ctx.reply(getStartedMessage(this.getBotName()));
        });
        this.command('help', async (ctx) => {
            if (ctx.from.is_bot) return ctx.reply('Bots are not allowed to use this bot!');
            return await ctx.reply(getStartedMessage(this.getBotName()));
        });
        this.command('kill', async (ctx) => {
            if (ctx.from.is_bot) return ctx.reply('Bots are not allowed to use this bot!');
            return await ctx.reply(`Please provide card details in any of these formats: .kill ${accpetedFormats[1]}`);
        });
        this.on('message', async (...args) => {
            await _sleep(500);
            this.messageHandler.emit('message', ...args);
        });
        this.messageHandler.handle();
    }

    async loginToTelegram() {
        this.launch().then(() => {
            this.oplogger.debug(`Bot has been started successfully! With bot name: ${this.botInfo.username} and id: ${this.botInfo.id} You can now interact with the bot.`);
        }).catch((err) => {
            this.oplogger.error(`Error in starting the bot: ${err.message}`);
        });
        this.botInfoClass = await this.telegram.getMe();
        this.oplogger.debug(`Bot has been started successfully!`);
    }

    getBotName() {
        return `@${this.botInfo.username}`;
    }

    async start() {
        this.initializeCommands();
        await this.loginToTelegram();
    }
}

const commands = (botNamee) => {
    return {
        start: '/start - To get started with the bot',
        help: '/help - To get help with the bot',
        kill: `.kill - To kill any card. Format: .kill ${accpetedFormats[1]}`
    };
};

const getStartedMessage = (botName) => {
    return `Welcome to ${botName}! I am here to help you with your queries. You can use the following commands to interact with me: ${Object.values(commands(botName)).join('\n')}`;
};

module.exports = { TelegramBot };