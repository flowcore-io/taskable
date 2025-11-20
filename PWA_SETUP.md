# PWA Setup Guide for Taskable

This document explains how the PWA (Progressive Web App) support is configured in Taskable and how to maintain it.

## What's Included

Taskable now has full PWA support, making it installable on phones, tablets, and desktops! 🎉

### Features

- ✅ **Installable**: Users can install Taskable on their home screen
- ✅ **Install Prompt**: Friendly popup encourages users to install the app
- ✅ **Offline Support**: Service worker caches assets for offline functionality
- ✅ **App Manifest**: Proper metadata for PWA installation
- ✅ **Adaptive Icons**: Maskable icons for Android adaptive icons
- ✅ **Theme Colors**: Dynamic theme colors for light/dark mode
- ✅ **Shortcuts**: Quick actions from the home screen icon

## Files Added

### 1. Manifest (`public/manifest.json`)

The app manifest defines how Taskable appears when installed:

- **Name & Description**: App identity
- **Icons**: Multiple sizes for different devices (72px to 512px)
- **Theme Colors**: Blue (#347cbf) for light mode, Orange (#fcaf2a) for dark mode
- **Display Mode**: Standalone (full-screen app experience)
- **Shortcuts**: Quick action to create a new todo

### 2. Next.js PWA Configuration (`next.config.js`)

Wrapped Next.js config with `next-pwa` to:

- Generate service worker automatically
- Cache static assets (fonts, images, styles)
- Configure cache strategies:
  - **CacheFirst**: Fonts, audio, video
  - **StaleWhileRevalidate**: Images, JS, CSS
  - **NetworkFirst**: Data, API routes excluded

### 3. Layout Metadata (`app/layout.tsx`)

Added PWA-specific metadata:

- **Viewport**: Separate export for Next.js 15 compliance
- **Theme Colors**: Adaptive based on color scheme preference
- **Apple Web App**: iOS-specific PWA settings
- **Icons**: Reference to generated icons

### 4. Install Prompt Component (`src/components/PWAInstallPrompt.tsx`)

Smart install prompt that:

- **Auto-detects** when the app is installable
- **Shows friendly popup** encouraging installation after 2 seconds
- **Remembers dismissals** with 7-day cooldown
- **One-click install** using native browser dialog
- **Adapts to theme** using your design system colors

See [docs/PWA_INSTALL_PROMPT.md](./docs/PWA_INSTALL_PROMPT.md) for detailed documentation.

## Generating Icons

### Prerequisites

Install `sharp` for image processing:

```bash
npm install -D sharp
```

### Generate Icons

Run the icon generation script:

```bash
node scripts/generate-icons.js
```

This will:

1. Read `public/taskable.png` as the source
2. Generate icons in 8 sizes: 72, 96, 128, 144, 152, 192, 384, 512
3. Create 2 maskable icons (192, 512) with proper safe zones for Android
4. Save all icons to `public/icons/`

### Manual Icon Creation

If you prefer to create icons manually or use a design tool:

1. **Regular Icons**: Use the logo on the app background (#f4f3f3)
2. **Maskable Icons**: Add 20% padding around the logo on blue background (#347cbf)

Required sizes:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png` (Apple)
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`
- `icon-maskable-192x192.png`
- `icon-maskable-512x512.png`

## Testing PWA Installation

### Desktop (Chrome/Edge)

1. Run the app: `npm run dev` (PWA disabled in dev) or `npm run build && npm start`
2. Open the app in Chrome/Edge
3. Look for the install icon (⊕) in the address bar
4. Click "Install Taskable"

### Mobile (Android)

1. Deploy the app to a public URL (HTTPS required)
2. Open in Chrome
3. Tap the menu (⋮) → "Add to Home screen"
4. App icon appears on your home screen!

### Mobile (iOS/Safari)

1. Deploy the app to a public URL (HTTPS required)
2. Open in Safari
3. Tap the share button (□↑)
4. Tap "Add to Home Screen"
5. App icon appears on your home screen!

## Updating PWA Configuration

### Change App Name or Description

Edit `public/manifest.json`:

```json
{
  "name": "Your New Name",
  "short_name": "Short Name",
  "description": "Your new description"
}
```

### Change Theme Colors

1. Update `public/manifest.json`:

```json
{
  "background_color": "#f4f3f3",
  "theme_color": "#347cbf"
}
```

2. Update `app/layout.tsx`:

```typescript
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#347cbf' },
    { media: '(prefers-color-scheme: dark)', color: '#fcaf2a' }
  ],
  // ...
};
```

### Add New Shortcuts

Edit `public/manifest.json` → `shortcuts` array:

```json
{
  "shortcuts": [
    {
      "name": "View Completed",
      "short_name": "Completed",
      "description": "View completed todos",
      "url": "/?filter=completed",
      "icons": [...]
    }
  ]
}
```

### Adjust Cache Strategies

Edit `next.config.js` → `runtimeCaching` array to add/modify cache rules.

## Production Deployment

### Environment Variables

No special environment variables needed for PWA functionality.

### Build Process

```bash
npm run build
npm start
```

The service worker is **automatically generated** during the build process:

- `public/sw.js` - Service worker
- `public/workbox-*.js` - Workbox runtime libraries

These files are gitignored and regenerated on each build.

### HTTPS Requirement

PWAs require HTTPS in production. Vercel, Netlify, and most hosting providers handle this automatically.

## Troubleshooting

### Icons Not Showing

1. Ensure icons exist in `public/icons/`
2. Clear browser cache and reinstall
3. Check browser console for 404 errors
4. Verify manifest.json is accessible at `/manifest.json`

### Install Button Not Appearing

1. **HTTPS Required**: PWAs only work on HTTPS (or localhost)
2. **Valid Manifest**: Check for JSON errors in manifest.json
3. **Icons Present**: At least 192x192 and 512x512 icons required
4. **Service Worker**: Check if sw.js is loading correctly

### Offline Not Working

1. Check service worker registration in DevTools → Application → Service Workers
2. Verify cache strategies in next.config.js
3. Clear cache and reload: DevTools → Application → Clear storage

### Updates Not Appearing

Service workers cache aggressively. To see updates:

1. Close all tabs with the app
2. Reopen (service worker updates)
3. Or: DevTools → Application → Service Workers → "Update"

## Resources

- [next-pwa Documentation](https://github.com/shadowwalker/next-pwa)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Maskable Icons Editor](https://maskable.app/editor)

## Benefits of PWA

1. **Install to Home Screen**: Users can install without app stores
2. **Offline Access**: Continue working without internet
3. **Fast Loading**: Cached assets load instantly
4. **Native Feel**: Fullscreen experience without browser UI
5. **Engagement**: Push notifications (can be added later)
6. **SEO**: Still works as a regular website

---

**Need help?** Check the [Next.js PWA examples](https://github.com/shadowwalker/next-pwa/tree/master/examples) or open an issue in the repo.

