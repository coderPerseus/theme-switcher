import { defineExtension, useCommand, useStatusBarItem, watchEffect } from 'reactive-vscode'
import { ConfigurationTarget, StatusBarAlignment, commands as vscodeCommands, extensions, window, workspace } from 'vscode'
import { commands } from './generated/meta'
import { config } from './config'

const { activate, deactivate } = defineExtension(() => {
  let autoSwitchTimer: ReturnType<typeof setInterval> | undefined

  // Status bar item
  const statusBarItem = useStatusBarItem({
    id: 'theme-switcher',
    alignment: StatusBarAlignment.Right,
    priority: 100,
  })

  statusBarItem.text = '$(color-mode)'
  statusBarItem.tooltip = 'Click to configure theme switcher'
  statusBarItem.command = commands.quickMenu
  statusBarItem.show()

  // Get all available themes
  async function getAvailableThemes(): Promise<string[]> {
    const themes: string[] = []
    for (const ext of extensions.all) {
      const contributes = ext.packageJSON?.contributes
      if (contributes?.themes) {
        for (const theme of contributes.themes) {
          if (theme.label)
            themes.push(theme.label)
          else if (theme.id)
            themes.push(theme.id)
        }
      }
    }
    return [...new Set(themes)].sort()
  }

  // Set theme
  async function setTheme(themeName: string) {
    await workspace.getConfiguration('workbench').update('colorTheme', themeName, ConfigurationTarget.Global)
  }

  // Get current theme
  function getCurrentTheme(): string {
    return workspace.getConfiguration('workbench').get('colorTheme', 'Default Dark Modern')
  }

  // Check if it's daytime
  function isDaytime(): boolean {
    const hour = new Date().getHours()
    const dayStart = config.dayStartHour ?? 7
    const nightStart = config.nightStartHour ?? 19
    return hour >= dayStart && hour < nightStart
  }

  // Auto switch theme based on time
  function autoSwitchTheme() {
    if (!config.autoSwitch)
      return
    const targetTheme = isDaytime() ? config.dayTheme : config.nightTheme
    if (targetTheme && getCurrentTheme() !== targetTheme)
      setTheme(targetTheme)
  }

  // Start auto switch timer
  function startAutoSwitch() {
    stopAutoSwitch()
    autoSwitchTheme()
    autoSwitchTimer = setInterval(autoSwitchTheme, 60000) // Check every minute
  }

  // Stop auto switch timer
  function stopAutoSwitch() {
    if (autoSwitchTimer) {
      clearInterval(autoSwitchTimer)
      autoSwitchTimer = undefined
    }
  }

  // Watch config changes
  watchEffect(() => {
    if (config.autoSwitch)
      startAutoSwitch()
    else
      stopAutoSwitch()
  })

  // Command: Select theme
  useCommand(commands.selectTheme, async () => {
    const themes = await getAvailableThemes()
    const currentTheme = getCurrentTheme()
    const selected = await window.showQuickPick(themes, {
      placeHolder: 'Select a theme',
      title: 'Theme Switcher',
      matchOnDescription: true,
    })
    if (selected)
      await setTheme(selected)
  })

  // Command: Quick menu
  useCommand(commands.quickMenu, async () => {
    const dayStart = config.dayStartHour ?? 7
    const nightStart = config.nightStartHour ?? 19
    const autoSwitchLabel = config.autoSwitch ? 'Disable Auto Switch' : 'Enable Auto Switch'
    const items = [
      {
        label: 'Select Theme (Now)',
        description: 'Change current theme immediately',
        command: commands.selectTheme,
      },
      {
        label: 'Set Day Theme',
        description: `Current: ${config.dayTheme ?? 'Default Light Modern'}`,
        command: commands.setDayTheme,
      },
      {
        label: 'Set Night Theme',
        description: `Current: ${config.nightTheme ?? 'Default Dark Modern'}`,
        command: commands.setNightTheme,
      },
      {
        label: 'Configure Time Range',
        description: `Day ${dayStart}:00 → Night ${nightStart}:00`,
        command: commands.configureSchedule,
      },
      {
        label: autoSwitchLabel,
        description: config.autoSwitch ? 'Currently on' : 'Currently off',
        command: commands.toggleAutoSwitch,
      },
    ]

    const selected = await window.showQuickPick(items, {
      placeHolder: 'Theme Switcher',
      title: 'Theme Switcher',
      matchOnDescription: true,
    })

    if (selected)
      await vscodeCommands.executeCommand(selected.command)
  })

  // Command: Set day theme
  useCommand(commands.setDayTheme, async () => {
    const themes = await getAvailableThemes()
    const selected = await window.showQuickPick(themes, {
      placeHolder: 'Select day theme',
      title: 'Set Day Theme',
    })
    if (selected) {
      await workspace.getConfiguration('theme-switcher').update('dayTheme', selected, ConfigurationTarget.Global)
      window.showInformationMessage(`Day theme set to: ${selected}`)
    }
  })

  // Command: Set night theme
  useCommand(commands.setNightTheme, async () => {
    const themes = await getAvailableThemes()
    const selected = await window.showQuickPick(themes, {
      placeHolder: 'Select night theme',
      title: 'Set Night Theme',
    })
    if (selected) {
      await workspace.getConfiguration('theme-switcher').update('nightTheme', selected, ConfigurationTarget.Global)
      window.showInformationMessage(`Night theme set to: ${selected}`)
    }
  })

  // Command: Toggle auto switch
  useCommand(commands.toggleAutoSwitch, async () => {
    const current = config.autoSwitch
    await workspace.getConfiguration('theme-switcher').update('autoSwitch', !current, ConfigurationTarget.Global)
    window.showInformationMessage(`Auto switch ${!current ? 'enabled' : 'disabled'}`)
  })

  // Command: Configure schedule
  useCommand(commands.configureSchedule, async () => {
    const dayHour = await window.showInputBox({
      prompt: 'Enter day start hour (0-23)',
      value: String(config.dayStartHour ?? 7),
      validateInput: (v) => {
        const n = Number.parseInt(v)
        return (Number.isNaN(n) || n < 0 || n > 23) ? 'Please enter a number between 0 and 23' : null
      },
    })
    if (dayHour === undefined)
      return

    const nightHour = await window.showInputBox({
      prompt: 'Enter night start hour (0-23)',
      value: String(config.nightStartHour ?? 19),
      validateInput: (v) => {
        const n = Number.parseInt(v)
        return (Number.isNaN(n) || n < 0 || n > 23) ? 'Please enter a number between 0 and 23' : null
      },
    })
    if (nightHour === undefined)
      return

    const cfg = workspace.getConfiguration('theme-switcher')
    await cfg.update('dayStartHour', Number.parseInt(dayHour), ConfigurationTarget.Global)
    await cfg.update('nightStartHour', Number.parseInt(nightHour), ConfigurationTarget.Global)
    window.showInformationMessage(`Schedule updated: Day ${dayHour}:00 - Night ${nightHour}:00`)
  })
})

export { activate, deactivate }
