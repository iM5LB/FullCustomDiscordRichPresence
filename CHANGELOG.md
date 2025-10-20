# Changelog

All notable changes to Full Custom Discord Rich Presence will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2025-10-20

### Added
- Complete rewrite with modern Discord API methods
- Support for all activity types (Playing, Streaming, Listening, Watching, Competing)
- Enhanced profile management system with enable/disable toggle
- Profile duplication feature for quick setup
- Better asset management and validation
- Improved button validation with proper URL checking
- Enhanced party size implementation
- Stream URL support for Streaming activity type
- Comprehensive error handling throughout
- Better user feedback with informative toast notifications
- Confirmation dialogs for destructive actions
- Organized settings UI with collapsible categories

### Improved
- Optimized performance and reduced memory usage
- Better Discord API integration
- Enhanced settings panel organization
- More reliable presence updates
- Cleaner code structure and readability
- Better default values for new profiles
- Enhanced timestamp controls

### Changed
- Renamed from AutoStartRichPresenceFivem to FullCustomDiscordRichPresence
- Updated all function names for better clarity
- Modernized code to use current best practices
- Improved settings layout and organization

### Fixed
- Activity type now properly changes between Playing, Streaming, etc.
- Better handling of empty/null values
- Improved asset loading reliability
- Fixed party size display issues
- Better handling of profile switching

## [2.0.23-fork] - Previous Version

### Fixed
- Handled case where min > max for fake players count

### Added
- Option to use party size for players count
- Notes in settings about using own client ID
- Fake or real players count in activity details

### Improved
- Display players count as online/max format
- Fixed activity data not being set to undefined if empty
- Fixed timestamp format to use milliseconds
- Updated to not use deprecated functions

---

## Future Plans

### Planned Features
- Import/Export profiles
- Scheduled profile switching
- Custom activity types
- More timestamp options
- Activity templates/presets
- Quick toggle hotkey

### Under Consideration
- Auto-detection of running applications
- Integration with external APIs
- Custom image upload helper
- Profile sharing system

---

For older changes, please refer to the git history.
