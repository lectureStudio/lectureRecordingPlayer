import { z } from 'zod'

/**
 * Zod schema for application settings.
 * Used for validation of user configuration.
 *
 * @property {('light'|'dark')} theme - The visual theme of the application.
 * @property {('left'|'right'|'none')} sidebarPosition - Position of the sidebar in the UI.
 * @property {object} splitPaneSizes - Sizes of the split panes as percentages.
 */
export const AppSettingsSchema = z.object({
  theme: z.enum(['light', 'dark']),
  sidebarPosition: z.enum(['left', 'right', 'none']),
  splitPaneSizes: z.object({
    sidebar: z.number().min(5).max(30).default(15),
    main: z.number().min(70).max(95).default(85),
  }).default({
    sidebar: 15,
    main: 85,
  }),
})

/**
 * Type definition for application settings.
 * Automatically inferred from the Zod schema.
 */
export type AppSettings = z.infer<typeof AppSettingsSchema>

/**
 * Defines the theme options for the application's appearance.
 * - 'light': Sets the application to use the light theme
 * - 'dark': Sets the application to use the dark theme
 *
 * Uses DaisyUI's data-theme attribute for theme switching.
 */
export type Theme = z.infer<typeof AppSettingsSchema>['theme']

/**
 * Defines the position of the sidebar in the application's layout.
 * - 'left': Positions the sidebar on the left side of the screen
 * - 'right': Positions the sidebar on the right side of the screen
 * - 'none': Hides the sidebar completely
 */
export type SidebarPosition = z.infer<typeof AppSettingsSchema>['sidebarPosition']
