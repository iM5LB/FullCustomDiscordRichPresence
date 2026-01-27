/**
 * @name FullCustomDiscordRichPresence
 * @version 1.0.1
 * @description Complete custom Discord Rich Presence plugin with advanced features, multiple profiles, and full activity control. Fixed for latest Discord updates.
 * @author iM5LB
 * @authorId 411189373397368832
 * @invite https://discord.gg/MYA5tYKXsY
 * @updateUrl https://raw.githubusercontent.com/iM5LB/FullCustomDiscordRichPresence/main/FullCustomDiscordRichPresence.plugin.js
 * @source https://github.com/iM5LB/FullCustomDiscordRichPresence
 * @website https://github.com/iM5LB/FullCustomDiscordRichPresence
 */

/*@cc_on
@if (@_jscript)
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    shell.Popup("It looks like you've tried to run me directly. (don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.\nJust reload Discord with Ctrl+R.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!\nJust reload Discord with Ctrl+R.", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();
@else @*/

const config = {
    changelog: [
        {
            title: "Version 1.0.1",
            type: "fixed",
            items: [
                "Fixed module discovery for Discord's latest updates (2025).",
                "Updated FluxDispatcher detection with multiple fallback methods.",
                "Fixed activity dispatch system for new Discord architecture.",
                "Improved asset manager discovery and error handling.",
                "Added better compatibility with Discord's internal changes.",
                "Fixed presence store detection for activity conflict checking."
            ]
        },
        {
            title: "Version 1.0.0",
            type: "added",
            items: [
                "Launched Full Custom Discord Rich Presence plugin.",
            ]
        }
    ]
};

const DEFAULT_CLIENT_ID = '999268584410845305';

const ActivityTypes = {
    PLAYING: 0,
    STREAMING: 1,
    LISTENING: 2,
    WATCHING: 3,
    COMPETING: 5
};

class FullCustomDiscordRichPresence {
    constructor(meta) {
        this.meta = meta;
        this.api = new BdApi(this.meta.name);
        this.initialized = false;
        this.settings = {};
        this.profiles = [];
        this.startTimestamp = Date.now();
        this.updateInterval = null;
        this.rpc = null;
        this.getLocalPresence = null;
        this.assetManager = null;
    }

    async start() {
        try {
            await this.initialize();
            this.showChangelog();
            
            if (!this.rpc) {
                this.api.UI.showToast(`${this.meta.name}: RPC module not found. Check console.`, { type: "error" });
            } else {
                this.api.UI.showToast(`${this.meta.name} started successfully!`, { type: "success" });
            }
        } catch (error) {
            this.api.Logger.error("Failed to start:", error);
            this.api.UI.showToast(`${this.meta.name} failed to start. Check console.`, { type: "error" });
        }
    }

    async initialize() {
        this.api.Logger.log("Initializing...");

        this.loadSettings();
        this.loadProfiles();
        this.setupWebpackModules();
        
        if (this.updateInterval) clearInterval(this.updateInterval);
        this.updateInterval = setInterval(() => this.updatePresence(), 15000);
        
        this.initialized = true;
        await this.updatePresence();
        
        this.api.Logger.log("Initialized successfully!");
    }

    setupWebpackModules() {
        const { Webpack, Logger } = this.api;
        const { Filters } = Webpack;

        try {
            // Enhanced FluxDispatcher discovery with multiple fallback methods
            this.rpc = this.findFluxDispatcher();

            // Enhanced Presence Store discovery
            this.getLocalPresence = this.findPresenceStore();

            // Enhanced Asset Manager discovery
            this.assetManager = this.findAssetManager();

            // Log discovery results
            if (!this.rpc) Logger.error("FluxDispatcher not found. Activity updates will not work.");
            if (!this.assetManager) Logger.warn("Asset Manager not found. Image keys will not be resolved.");
            if (!this.getLocalPresence) Logger.warn("Presence Store not found. 'Disable when other activity' may fail.");
            
        } catch (error) {
            this.api.Logger.error("Error setting up Webpack modules:", error);
        }
    }

    findFluxDispatcher() {
        const { Webpack } = this.api;
        const { Filters } = Webpack;

        // Method 1: Look for the main FluxDispatcher
        let dispatcher = Webpack.getModule(m => 
            m?.default?.dispatch && 
            m?.default?.subscribe && 
            m?.default?.unsubscribe &&
            !m?.default?.getName
        )?.default;

        if (dispatcher) return dispatcher;

        // Method 2: Look for dispatcher with different structure
        dispatcher = Webpack.getModule(m => 
            m?.dispatch && 
            m?.subscribe && 
            m?.unsubscribe &&
            typeof m.dispatch === "function" &&
            !m.getName
        );

        if (dispatcher) return dispatcher;

        // Method 3: Look for FluxDispatcher by keys
        dispatcher = Webpack.getModule(Filters.byKeys("dispatch", "subscribe", "unsubscribe"));
        if (dispatcher) return dispatcher;

        // Method 4: Look for dispatcher in different export patterns
        const dispatcherModule = Webpack.getModule(m => {
            if (!m || typeof m !== "object") return false;
            for (const key in m) {
                const obj = m[key];
                if (obj && typeof obj === "object" && 
                    typeof obj.dispatch === "function" && 
                    typeof obj.subscribe === "function") {
                    return true;
                }
            }
            return false;
        });

        if (dispatcherModule) {
            for (const key in dispatcherModule) {
                const obj = dispatcherModule[key];
                if (obj && typeof obj === "object" && 
                    typeof obj.dispatch === "function" && 
                    typeof obj.subscribe === "function") {
                    return obj;
                }
            }
        }

        // Method 5: Search by string patterns (last resort)
        const stringSearchModule = Webpack.getModule(m => {
            if (!m || typeof m !== "object") return false;
            const str = m.toString?.() || "";
            return str.includes("dispatch") && str.includes("subscribe") && str.includes("_subscriptions");
        });

        return stringSearchModule;
    }

    findPresenceStore() {
        const { Webpack } = this.api;

        // Method 1: Look for presence store with getLocalPresence
        let presenceStore = Webpack.getModule(m => 
            m?.getLocalPresence && 
            m?.getPresence &&
            typeof m.getLocalPresence === "function"
        );

        if (presenceStore) return presenceStore.getLocalPresence.bind(presenceStore);

        // Method 2: Look for presence store in different structure
        presenceStore = Webpack.getModule(m => 
            m?.default?.getLocalPresence && 
            typeof m.default.getLocalPresence === "function"
        );

        if (presenceStore) return presenceStore.default.getLocalPresence.bind(presenceStore.default);

        // Method 3: Search by string patterns
        const presenceModule = Webpack.getModule(m => {
            if (!m || typeof m !== "object") return false;
            const str = m.toString?.() || "";
            return str.includes("getLocalPresence") || str.includes("LOCAL_PRESENCE");
        });

        if (presenceModule?.getLocalPresence) {
            return presenceModule.getLocalPresence.bind(presenceModule);
        }

        return null;
    }

    findAssetManager() {
        const { Webpack } = this.api;

        // Method 1: Look for asset manager by function signature
        const assetModule = Webpack.getModule(m => {
            if (!m || typeof m !== "object") return false;
            for (const key in m) {
                if (typeof m[key] === "function") {
                    const str = m[key].toString();
                    if (str.includes("APPLICATION_ASSETS") || str.includes("getAssetImage")) {
                        return true;
                    }
                }
            }
            return false;
        });

        if (assetModule) {
            for (const key in assetModule) {
                if (typeof assetModule[key] === "function") {
                    const str = assetModule[key].toString();
                    if (str.includes("APPLICATION_ASSETS") || str.includes("getAssetImage")) {
                        return assetModule[key];
                    }
                }
            }
        }

        // Method 2: Look for asset manager by different patterns
        const assetManager = Webpack.getModule(m => 
            typeof m === "function" && 
            m.toString().includes("APPLICATION_ASSETS")
        );

        if (assetManager) return assetManager;

        // Method 3: Look in default exports
        const defaultAssetModule = Webpack.getModule(m => 
            m?.default && 
            typeof m.default === "function" && 
            m.default.toString().includes("APPLICATION_ASSETS")
        );

        return defaultAssetModule?.default;
    }

    async getAsset(key, clientID) {
        if (!key || !this.assetManager) return key;
        try {
            const id = clientID || DEFAULT_CLIENT_ID;
            const result = await this.assetManager(id, [key, undefined]);
            return result?.[0] || key;
        } catch (error) {
            this.api.Logger.error("Failed to get asset:", error);
            return key;
        }
    }

    loadSettings() {
        const defaultSettings = {
            activeProfileID: 0,
            disableWhenActivity: false,
            enableQuickToggle: true,
            updateInterval: 15
        };
        this.settings = { ...defaultSettings, ...this.api.Data.load("settings") };
    }

    loadProfiles() {
        const defaultProfile = {
            pname: "Default Profile",
            enabled: true,
            clientID: "",
            activityType: ActivityTypes.PLAYING,
            name: "Custom Activity",
            details: "",
            state: "",
            button1Label: "",
            button1URL: "",
            button2Label: "",
            button2URL: "",
            largeImageKey: "",
            largeImageText: "",
            smallImageKey: "",
            smallImageText: "",
            streamURL: "",
            enableStartTime: false,
            enableEndTime: false,
            customStartTime: null,
            customEndTime: null,
            enablePartySize: false,
            partySize: 1,
            partyMax: 5,
            enablePlayersCount: false,
            playersFake: true,
            playersFixed: 50,
            playersMin: 30,
            playersMax: 100,
            maxPlayers: 100
        };

        let loadedProfiles = this.api.Data.load("profiles");
        
        if (!loadedProfiles || !Array.isArray(loadedProfiles) || loadedProfiles.length === 0) {
            loadedProfiles = [{ ...defaultProfile }];
        }

        this.profiles = loadedProfiles.map(p => ({ ...defaultProfile, ...p }));
        
        if (this.settings.activeProfileID >= this.profiles.length) {
            this.settings.activeProfileID = 0;
        }
    }

    saveSettings() {
        this.api.Data.save("settings", this.settings);
    }

    saveProfiles() {
        this.api.Data.save("profiles", this.profiles);
    }

    get activeProfile() {
        return this.profiles[this.settings.activeProfileID] || this.profiles[0];
    }

    showChangelog() {
        const savedVersion = this.api.Data.load("version");
        if (savedVersion !== this.meta.version) {
            this.api.UI.showChangelogModal({
                title: this.meta.name,
                subtitle: this.meta.version,
                blurb: "Complete custom Discord Rich Presence with advanced features",
                changes: config.changelog
            });
            this.api.Data.save("version", this.meta.version);
        }
    }

    async stop() {
        this.api.Logger.log("Stopping...");
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        this.initialized = false;
        this.clearActivity();
        
        this.api.UI.showToast(`${this.meta.name} stopped!`, { type: "info" });
        this.api.Logger.log("Stopped successfully!");
    }

    clearActivity() {
        this.setActivity({});
    }

    setActivity(activity) {
        if (!this.rpc) return;

        try {
            const hasActivity = activity && Object.keys(activity).length > 0;
            
            // Enhanced activity dispatch with multiple methods
            const baseAction = {
                type: "LOCAL_ACTIVITY_UPDATE",
                activity: hasActivity ? { ...activity, flags: 1 } : {}
            };

            // Method 1: Try with socketId (newer Discord)
            try {
                this.rpc.dispatch({
                    ...baseAction,
                    socketId: "main"
                });
                return;
            } catch (e) {
                this.api.Logger.warn("Method 1 failed, trying method 2:", e.message);
            }

            // Method 2: Try without socketId (older Discord)
            try {
                this.rpc.dispatch(baseAction);
                return;
            } catch (e) {
                this.api.Logger.warn("Method 2 failed, trying method 3:", e.message);
            }

            // Method 3: Try with different action structure
            try {
                this.rpc.dispatch({
                    type: "LOCAL_ACTIVITY_UPDATE",
                    socketId: "main",
                    ...baseAction.activity && { activity: baseAction.activity }
                });
                return;
            } catch (e) {
                this.api.Logger.error("All dispatch methods failed:", e);
            }

        } catch (error) {
            this.api.Logger.error("Failed to set activity:", error);
        }
    }

    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    async updatePresence() {
        if (!this.initialized) return;

        const profile = this.activeProfile;
        if (!profile || !profile.enabled) {
            this.clearActivity();
            return;
        }

        if (this.settings.disableWhenActivity && this.hasOtherActivity()) {
            return;
        }

        try {
            const activity = await this.buildActivity(profile);
            this.setActivity(activity);
        } catch (error) {
            this.api.Logger.error("Failed to update presence:", error);
        }
    }

    hasOtherActivity() {
        if (!this.getLocalPresence) return false;

        try {
            const presence = this.getLocalPresence();
            const activities = presence?.activities || [];
            const profile = this.activeProfile;
            const clientID = profile.clientID || DEFAULT_CLIENT_ID;
            
            return activities.some(a => 
                a?.application_id && 
                a.application_id !== clientID
            );
        } catch (error) {
            this.api.Logger.error("Error in hasOtherActivity:", error);
            return false;
        }
    }

    async buildActivity(profile) {
        const clientID = profile.clientID || DEFAULT_CLIENT_ID;
        const activity = {
            application_id: clientID,
            name: profile.name || "Custom Activity",
            type: profile.activityType ?? ActivityTypes.PLAYING
        };

        let details = profile.details || "";
        
        if (profile.enablePlayersCount) {
            const playerCount = this.calculatePlayerCount(profile);
            details = details ? `${details} (${playerCount}/${profile.maxPlayers})` : `${playerCount}/${profile.maxPlayers}`;
        }

        if (details) activity.details = details;
        if (profile.state) activity.state = profile.state;

        if (profile.activityType === ActivityTypes.STREAMING && profile.streamURL) {
            activity.url = profile.streamURL;
        }

        const timestamps = this.buildTimestamps(profile);
        if (timestamps) activity.timestamps = timestamps;

        const assets = await this.buildAssets(profile, clientID);
        if (Object.keys(assets).length > 0) activity.assets = assets;

        if (profile.enablePartySize) {
            activity.party = {
                id: `party-${clientID}-${Date.now()}`,
                size: [
                    Math.min(profile.partySize, profile.partyMax),
                    profile.partyMax
                ]
            };
        }

        const buttons = this.buildButtons(profile);
        if (buttons.length > 0) {
            activity.buttons = buttons;
            activity.metadata = { button_urls: buttons.map(b => b.url) };
        }

        return activity;
    }

    calculatePlayerCount(profile) {
        if (profile.playersFake) {
            const min = Math.min(profile.playersMin, profile.playersMax);
            const max = Math.max(profile.playersMin, profile.playersMax);
            const count = Math.floor(Math.random() * (max - min + 1)) + min;
            return Math.min(count, profile.maxPlayers);
        }
        return Math.min(profile.playersFixed, profile.maxPlayers);
    }

    buildTimestamps(profile) {
        const timestamps = {};

        if (profile.enableStartTime) {
            timestamps.start = profile.customStartTime 
                ? Math.floor(new Date(profile.customStartTime).getTime())
                : Math.floor(this.startTimestamp);
        }

        if (profile.enableEndTime && profile.customEndTime) {
            timestamps.end = Math.floor(new Date(profile.customEndTime).getTime());
        }

        return Object.keys(timestamps).length > 0 ? timestamps : null;
    }

    async buildAssets(profile, clientID) {
        const assets = {};

        if (profile.largeImageKey) {
            assets.large_image = await this.getAsset(profile.largeImageKey, clientID);
            if (profile.largeImageText) assets.large_text = profile.largeImageText;
        }

        if (profile.smallImageKey) {
            assets.small_image = await this.getAsset(profile.smallImageKey, clientID);
            if (profile.smallImageText) assets.small_text = profile.smallImageText;
        }

        return assets;
    }

    buildButtons(profile) {
        const buttons = [];

        if (profile.button1Label && profile.button1URL && this.isValidURL(profile.button1URL)) {
            if (profile.button1Label.length <= 32) {
                buttons.push({ label: profile.button1Label, url: profile.button1URL });
            }
        }

        if (profile.button2Label && profile.button2URL && this.isValidURL(profile.button2URL)) {
            if (profile.button2Label.length <= 32) {
                buttons.push({ label: profile.button2Label, url: profile.button2URL });
            }
        }

        return buttons;
    }

    getSettingsPanel() {
        if (!this.initialized) return;

        const settings = [
            {
                type: "category",
                id: "general",
                name: "General Settings",
                collapsible: true,
                shown: true,
                settings: [
                    {
                        type: "dropdown",
                        id: "activeProfile",
                        name: "Active Profile",
                        note: "Select which profile to use for your Rich Presence",
                        value: this.settings.activeProfileID,
                        options: this.profiles.map((p, i) => ({ 
                            value: i, 
                            label: `${p.pname}${p.enabled ? '' : ' (Disabled)'}` 
                        }))
                    },
                    {
                        type: "switch",
                        id: "disableWhenActivity",
                        name: "Disable When Other Activity",
                        note: "Automatically disable Rich Presence when another activity is detected",
                        value: this.settings.disableWhenActivity
                    }
                ]
            },
            {
                type: "category",
                id: "profiles",
                name: "Profile Management",
                collapsible: true,
                shown: false,
                settings: [
                    {
                        type: "button",
                        id: "createProfile",
                        children: "Create New Profile",
                        note: "Create a new Rich Presence profile",
                        onClick: () => this.createProfile(),
                        color: this.api.Components.Button.Colors.GREEN
                    },
                    {
                        type: "button",
                        id: "duplicateProfile",
                        children: "Duplicate Current Profile",
                        note: "Create a copy of the currently active profile",
                        onClick: () => this.duplicateProfile(),
                        color: this.api.Components.Button.Colors.BRAND
                    }
                ]
            }
        ];

        this.profiles.forEach((profile, index) => {
            settings.push(this.buildProfileSettings(profile, index));
        });

        return this.api.UI.buildSettingsPanel({
            settings: settings,
            onChange: (category, id, value) => this.handleSettingsChange(category, id, value)
        });
    }

    buildProfileSettings(profile, index) {
        return {
            type: "category",
            id: `profile_${index}`,
            name: `Profile: ${profile.pname}`,
            collapsible: true,
            shown: false,
            settings: [
                {
                    type: "text",
                    id: "pname",
                    name: "Profile Name",
                    note: "Name for this profile (not shown on Discord)",
                    value: profile.pname
                },
                {
                    type: "switch",
                    id: "enabled",
                    name: "Enable Profile",
                    note: "Enable or disable this profile",
                    value: profile.enabled
                },
                {
                    type: "text",
                    id: "clientID",
                    name: "Application Client ID",
                    note: "Your Discord Application ID (Required for images)",
                    value: profile.clientID,
                    placeholder: DEFAULT_CLIENT_ID
                },
                {
                    type: "dropdown",
                    id: "activityType",
                    name: "Activity Type",
                    note: "Choose the type of activity to display",
                    value: profile.activityType,
                    options: [
                        { label: "Playing", value: ActivityTypes.PLAYING },
                        { label: "Streaming", value: ActivityTypes.STREAMING },
                        { label: "Listening to", value: ActivityTypes.LISTENING },
                        { label: "Watching", value: ActivityTypes.WATCHING },
                        { label: "Competing in", value: ActivityTypes.COMPETING }
                    ]
                },
                {
                    type: "text",
                    id: "name",
                    name: "Activity Name",
                    note: "Main activity name (e.g., 'Visual Studio Code')",
                    value: profile.name,
                    placeholder: "Custom Activity"
                },
                {
                    type: "text",
                    id: "details",
                    name: "Details",
                    note: "First line of details",
                    value: profile.details,
                    placeholder: "Working on a project"
                },
                {
                    type: "text",
                    id: "state",
                    name: "State",
                    note: "Second line of details",
                    value: profile.state,
                    placeholder: "In a call"
                },
                {
                    type: "text",
                    id: "streamURL",
                    name: "Stream URL",
                    note: "Twitch or YouTube URL",
                    value: profile.streamURL,
                    placeholder: "https://twitch.tv/username"
                },
                {
                    type: "text",
                    id: "largeImageKey",
                    name: "Large Image Key",
                    note: "Asset key for large image",
                    value: profile.largeImageKey,
                    placeholder: "large_icon"
                },
                {
                    type: "text",
                    id: "largeImageText",
                    name: "Large Image Tooltip",
                    note: "Text shown when hovering over large image",
                    value: profile.largeImageText,
                    placeholder: "Hover text"
                },
                {
                    type: "text",
                    id: "smallImageKey",
                    name: "Small Image Key",
                    note: "Asset key for small image",
                    value: profile.smallImageKey,
                    placeholder: "small_icon"
                },
                {
                    type: "text",
                    id: "smallImageText",
                    name: "Small Image Tooltip",
                    note: "Text shown when hovering over small image",
                    value: profile.smallImageText,
                    placeholder: "Status"
                },
                {
                    type: "switch",
                    id: "enableStartTime",
                    name: "Enable Start Timestamp",
                    note: "Show elapsed time since start",
                    value: profile.enableStartTime
                },
                {
                    type: "switch",
                    id: "enablePartySize",
                    name: "Enable Party Size",
                    note: "Show party/group size",
                    value: profile.enablePartySize
                },
                {
                    type: "number",
                    id: "partySize",
                    name: "Current Party Size",
                    note: "Current number in party",
                    value: profile.partySize,
                    min: 1
                },
                {
                    type: "number",
                    id: "partyMax",
                    name: "Max Party Size",
                    note: "Maximum party size",
                    value: profile.partyMax,
                    min: 1
                },
                {
                    type: "switch",
                    id: "enablePlayersCount",
                    name: "Enable Player Count",
                    note: "Show player count in details",
                    value: profile.enablePlayersCount
                },
                {
                    type: "switch",
                    id: "playersFake",
                    name: "Randomize Player Count",
                    note: "Use random player count instead of fixed",
                    value: profile.playersFake
                },
                {
                    type: "number",
                    id: "playersFixed",
                    name: "Fixed Player Count",
                    note: "Fixed number of players",
                    value: profile.playersFixed,
                    min: 0
                },
                {
                    type: "number",
                    id: "playersMin",
                    name: "Min Random Players",
                    note: "Minimum random player count",
                    value: profile.playersMin,
                    min: 0
                },
                {
                    type: "number",
                    id: "playersMax",
                    name: "Max Random Players",
                    note: "Maximum random player count",
                    value: profile.playersMax,
                    min: 0
                },
                {
                    type: "number",
                    id: "maxPlayers",
                    name: "Server Max Players",
                    note: "Total server capacity",
                    value: profile.maxPlayers,
                    min: 1
                },
                {
                    type: "text",
                    id: "button1Label",
                    name: "Button 1 Label",
                    note: "Max 32 chars",
                    value: profile.button1Label,
                    placeholder: "Visit Website",
                    maxLength: 32
                },
                {
                    type: "text",
                    id: "button1URL",
                    name: "Button 1 URL",
                    note: "URL for first button",
                    value: profile.button1URL,
                    placeholder: "https://example.com"
                },
                {
                    type: "text",
                    id: "button2Label",
                    name: "Button 2 Label",
                    note: "Max 32 chars",
                    value: profile.button2Label,
                    placeholder: "Join Discord",
                    maxLength: 32
                },
                {
                    type: "text",
                    id: "button2URL",
                    name: "Button 2 URL",
                    note: "URL for second button",
                    value: profile.button2URL,
                    placeholder: "https://discord.gg/invite"
                },
                {
                    type: "button",
                    id: "deleteProfile",
                    children: "Delete This Profile",
                    note: "Permanently delete this profile",
                    onClick: () => this.deleteProfile(index),
                    color: this.api.Components.Button.Colors.RED
                }
            ]
        };
    }

    handleSettingsChange(category, id, value) {
        if (category === "general") {
            if (id === "activeProfile") {
                this.settings.activeProfileID = value;
                this.saveSettings();
                this.updatePresence();
            } else if (id === "disableWhenActivity") {
                this.settings.disableWhenActivity = value;
                this.saveSettings();
            }
        } else if (category?.startsWith("profile_")) {
            const profileIndex = parseInt(category.replace("profile_", ""));
            if (profileIndex >= 0 && profileIndex < this.profiles.length) {
                this.profiles[profileIndex][id] = value;
                this.saveProfiles();
                
                if (profileIndex === this.settings.activeProfileID) {
                    setTimeout(() => this.updatePresence(), 500);
                }
            }
        }
    }

    createProfile() {
        const newProfile = {
            pname: `Profile ${this.profiles.length + 1}`,
            enabled: true,
            clientID: "",
            activityType: ActivityTypes.PLAYING,
            name: "Custom Activity",
            details: "",
            state: "",
            button1Label: "",
            button1URL: "",
            button2Label: "",
            button2URL: "",
            largeImageKey: "",
            largeImageText: "",
            smallImageKey: "",
            smallImageText: "",
            streamURL: "",
            enableStartTime: false,
            enableEndTime: false,
            customStartTime: null,
            customEndTime: null,
            enablePartySize: false,
            partySize: 1,
            partyMax: 5,
            enablePlayersCount: false,
            playersFake: true,
            playersFixed: 50,
            playersMin: 30,
            playersMax: 100,
            maxPlayers: 100
        };

        this.profiles.push(newProfile);
        this.saveProfiles();
        this.api.UI.showToast("Profile created! Reopen settings to see it.", { type: "success" });
    }

    duplicateProfile() {
        const currentProfile = this.activeProfile;
        const duplicatedProfile = {
            ...currentProfile,
            pname: `${currentProfile.pname} (Copy)`
        };

        this.profiles.push(duplicatedProfile);
        this.saveProfiles();
        this.api.UI.showToast("Profile duplicated!", { type: "success" });
    }

    deleteProfile(index) {
        if (this.profiles.length <= 1) {
            this.api.UI.showToast("Cannot delete the last profile!", { type: "error" });
            return;
        }

        this.api.UI.showConfirmationModal(
            "Delete Profile",
            `Are you sure you want to delete "${this.profiles[index].pname}"?`,
            {
                danger: true,
                confirmText: "Delete",
                onConfirm: () => {
                    this.profiles.splice(index, 1);
                    
                    if (this.settings.activeProfileID >= index) {
                        this.settings.activeProfileID = Math.max(0, this.settings.activeProfileID - 1);
                        this.saveSettings();
                    }
                    
                    this.saveProfiles();
                    this.updatePresence();
                    this.api.UI.showToast("Profile deleted!", { type: "success" });
                }
            }
        );
    }
}

module.exports = FullCustomDiscordRichPresence;
/*@end @*/
