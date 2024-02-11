# Luna Discord Bot
## Getting Started

### First you need to set up your `.env`
```env
DISCORD_TOKEN=YOUR_DISCORD_TOKEN
API_KEY=YOUR_API_KEY
```
#### Discord Token
The Discord token can be found at [Discord's developer portal](https://discord.com/developers/applications). You will have to make an application and get a bot token.

#### API Key
The API key is for the Luna backend. It's currently unavailable to the public, at the very least until Riot oauth is implemented.

### Next is `config.json`

```json
{
    "client_id": "BOT_ID",
    "guild_id": "SERVER_ID",
    "party_category_id": "CHANNEL_CATEGORY_ID",
    "level_channel_id": "LEVEL_CHANNEL_ID",
    "api_url": "BACKEND_API_URL"
}
```

#### Client ID
This is your bot's ID, and can be found at [Discord's developer portal](https://discord.com/developers/applications) next to where you found your bot token.

#### Guild ID
This is the ID of your server. This can be found by enabling developer mode (settings -> advanced -> developer mode), then right click your server icon and click "Copy Server ID"

#### Party category ID
This is the category you want the bot to make party voicechats under. You can get this by enabling developer mode, right clicking your category of choice, and clicking "Copy Channel ID"

#### Level channel ID
The channel you want the bot to send its level up messages in.

# COMING SOON