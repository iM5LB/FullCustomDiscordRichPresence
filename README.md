# Full Custom Discord Rich Presence

A powerful Discord plugin that gives you complete control over your Rich Presence status with advanced customization options and multiple profile support.

## Features

✨ **Complete Customization**
- Set custom activity name, details, and state
- Choose from 5 activity types: Playing, Streaming, Listening, Watching, Competing
- Add custom images (large and small) with tooltips
- Add up to 2 clickable buttons with custom URLs

🎮 **Advanced Options**
- Multiple profile support - switch between different presence configurations
- Party size display (e.g., "2 of 5 in party")
- Player count system (fixed or randomized)
- Timestamp support (elapsed time)
- Streaming status with Twitch/YouTube URL support

⚙️ **Smart Features**
- Auto-disable when other activities are detected
- Profile duplication for quick setup
- Modern Discord API integration
- Lightweight and optimized performance

## Installation

### BetterDiscord

1. **Download BetterDiscord**
   - Visit [betterdiscord.app](https://betterdiscord.app/)
   - Download and install BetterDiscord for your platform

2. **Install the Plugin**
   - Download `FullCustomDiscordRichPresence.plugin.js`
   - Open Discord Settings → BetterDiscord → Plugins
   - Click "Open Plugins Folder"
   - Move the downloaded `.plugin.js` file into this folder

3. **Enable the Plugin**
   - Return to Discord Settings → BetterDiscord → Plugins
   - Toggle on "Full Custom Discord Rich Presence"
   - Configure your settings by clicking the settings gear icon

### Vencord

1. **Install Vencord**
   - Visit [vencord.dev](https://vencord.dev/)
   - Download and install Vencord for your platform

2. **Install the Plugin**
   - Download `FullCustomDiscordRichPresence.plugin.js`
   - Navigate to your Discord installation folder:
     - **Windows**: `%appdata%\Vencord\plugins\`
     - **macOS**: `~/Library/Application Support/Vencord/plugins/`
     - **Linux**: `~/.config/Vencord/plugins/`
   - Create the `plugins` folder if it doesn't exist
   - Move the `.plugin.js` file into this folder

3. **Enable the Plugin**
   - Open Discord Settings → Vencord → Plugins
   - Find "Full Custom Discord Rich Presence" and enable it
   - Configure your settings

## Configuration

### Creating a Discord Application

To use custom images and make your Rich Presence visible to others, you need to create a Discord application:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Copy your "Application ID" (this is your Client ID)
4. Navigate to "Rich Presence" → "Art Assets"
5. Upload your images and note the asset keys
6. Paste your Application ID in the plugin settings under "Application Client ID"

### Setting Up Your Profile

1. **Basic Information**
   - Profile Name: Internal name for your profile
   - Activity Type: Choose Playing, Streaming, Listening, Watching, or Competing
   - Activity Name: The main title (e.g., "Visual Studio Code")
   - Details: First line of text
   - State: Second line of text

2. **Images**
   - Upload assets in your Discord application
   - Use the asset keys in "Large Image Key" and "Small Image Key"
   - Add tooltips that appear on hover

3. **Buttons**
   - Add up to 2 buttons with custom text and URLs
   - Button labels max 32 characters
   - Note: Buttons only visible to others if your app is verified by Discord

4. **Advanced Options**
   - Enable timestamps to show elapsed time
   - Use party size to show group information
   - Add player counts for gaming activities

### Multiple Profiles

- Create multiple profiles for different scenarios
- Duplicate existing profiles to save time
- Switch between profiles instantly
- Each profile saves all settings independently

## Troubleshooting

**Rich Presence not showing:**
- Make sure the plugin is enabled
- Check if "Enable Profile" is toggled on for your active profile
- Verify your Activity Status is set to "Online" in Discord
- Restart Discord (Ctrl+R)

**Images not displaying:**
- Ensure you've created a Discord application
- Upload your images to the application's Rich Presence assets
- Use the exact asset key names in the plugin settings
- Wait a few minutes after uploading new assets

**Only visible to me:**
- You need to use your own Application Client ID
- The default client ID is for testing only
- Create an application at the Discord Developer Portal

**Buttons not showing:**
- Buttons are only visible to others if your Discord application is verified
- Verify your button URLs are valid
- Button labels must be 32 characters or less

## Support

For issues, feature requests, or questions:
- Open an issue on [GitHub](https://github.com/iM5LB/FullCustomDiscordRichPresence/issues)
- Check existing issues for solutions
- Provide detailed information about your problem

## License

This project is free to use and modify for personal use.

---

**Disclaimer:** This plugin uses Discord's client modifications. While Rich Presence is a supported Discord feature, using client modifications may technically violate Discord's Terms of Service. Use at your own risk.
