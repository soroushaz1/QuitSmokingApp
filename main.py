from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Application, CommandHandler, ContextTypes

# Replace with your app's URL
WEB_APP_URL = "https://soroushaz1.github.io/QuitSmokingApp/"

# Start command handler
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    # Create an inline keyboard button
    keyboard = [
        [InlineKeyboardButton("Open Quit Smoking Tracker", web_app={"url": WEB_APP_URL})]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    # Send the message with the button
    await update.message.reply_text(
        "Welcome to the Quit Smoking Tracker! Click the button below to open the app.",
        reply_markup=reply_markup,
    )

def main():
    # Replace 'YOUR_BOT_TOKEN' with your actual bot token from BotFather
    application = Application.builder().token("7201631406:AAH0ZZ446YcNBiZ8UduoEeXMTQsGnilxt_M").build()

    # Register the /start command
    application.add_handler(CommandHandler("start", start))

    # Start the bot
    application.run_polling()

if __name__ == "__main__":
    main()
