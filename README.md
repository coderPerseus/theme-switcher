# Theme Switcher

Quickly switch VS Code themes with status bar, command palette, and auto time-based switching.

## Features

- 🎨 Status bar button for quick theme switching
- 🌙 Auto switch themes based on time (day/night)
- ⌨️ Command palette support (Cmd+Shift+P)
- ⚙️ Full settings integration

## Configurations

| Key                             | Description                               | Type      | Default                  |
| ------------------------------- | ----------------------------------------- | --------- | ------------------------ |
| `theme-switcher.dayTheme`       | Theme to use during daytime               | `string`  | `"Default Light Modern"` |
| `theme-switcher.nightTheme`     | Theme to use during nighttime             | `string`  | `"Default Dark Modern"`  |
| `theme-switcher.autoSwitch`     | Automatically switch themes based on time | `boolean` | `false`                  |
| `theme-switcher.dayStartHour`   | Hour when daytime starts (0-23)           | `number`  | `7`                      |
| `theme-switcher.nightStartHour` | Hour when nighttime starts (0-23)         | `number`  | `19`                     |

## Commands

| Command                            | Title                              |
| ---------------------------------- | ---------------------------------- |
| `theme-switcher.quickMenu`         | Theme Switcher: Quick Menu         |
| `theme-switcher.selectTheme`       | Theme Switcher: Select Theme       |
| `theme-switcher.setDayTheme`       | Theme Switcher: Set Day Theme      |
| `theme-switcher.setNightTheme`     | Theme Switcher: Set Night Theme    |
| `theme-switcher.toggleAutoSwitch`  | Theme Switcher: Toggle Auto Switch |
| `theme-switcher.configureSchedule` | Theme Switcher: Configure Schedule |

## License

MIT
