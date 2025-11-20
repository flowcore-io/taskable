# PWA Install Prompt Component

## Overview

The PWA Install Prompt is a user-friendly popup that encourages users to install Taskable on their device. It appears automatically when the browser detects that the app is installable.

## Features

### ✨ Smart Detection
- **Auto-detects installability** using the `beforeinstallprompt` event
- **Checks if already installed** via display mode detection
- **Respects user dismissals** with 7-day cooldown period

### 🎨 Beautiful Design
- **Matches app theme** using Taskable's design system
- **Responsive layout** adapts to mobile and desktop
- **Smooth animations** with fade-in effect
- **Accessible** with proper ARIA labels

### 🧠 Smart Behavior
- **Delayed appearance** (2 seconds) for better UX
- **Remembers dismissal** using localStorage
- **Auto-hides** after installation
- **One-click install** using native browser prompt

## Component Location

```
src/components/PWAInstallPrompt.tsx
```

## How It Works

### 1. Browser Support Detection

The component listens for the `beforeinstallprompt` event, which is fired when:
- The app meets PWA criteria (manifest, service worker, HTTPS)
- The user hasn't installed the app yet
- The browser supports PWA installation (Chrome, Edge, Samsung Internet)

### 2. User Experience Flow

```
User visits app
     ↓
Wait 2 seconds
     ↓
Show install prompt
     ↓
User clicks "Install" ────────→ Native install dialog
     ↓                                    ↓
User clicks "Not now" ───→ Remember dismissal for 7 days
```

### 3. Dismissal Logic

When a user clicks "Not now":
- Dismissal timestamp saved to `localStorage`
- Prompt won't show again for 7 days
- After 7 days, prompt reappears (if still not installed)

### 4. Installation Detection

The component detects installation through:
- `appinstalled` event (user completed installation)
- `display-mode: standalone` media query (app is running installed)

## Technical Implementation

### Key Features

#### Event Handling
```typescript
window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
window.addEventListener('appinstalled', handleAppInstalled);
```

#### Install Prompt Trigger
```typescript
const handleInstallClick = async () => {
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  // Handle user's choice
};
```

#### Dismissal Tracking
```typescript
const dismissed = localStorage.getItem('pwa-install-dismissed');
const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

if (daysSinceDismissed < 7) {
  return; // Don't show yet
}
```

## Visual Design

### Layout
```
┌─────────────────────────────────────────┐
│  [Icon]  Install Taskable           [X] │
│                                          │
│  Install our app for quick access and   │
│  offline use. Works like a native app!  │
│                                          │
│  [Install Button]  [Not now]            │
└─────────────────────────────────────────┘
```

### Colors & Styling
- **Background**: Card background with 2px primary border
- **Icon**: Smartphone icon with primary color
- **Buttons**: 
  - Primary button (Install) - Blue/Orange based on theme
  - Secondary button (Not now) - Muted background on hover
- **Animation**: Slides in from bottom with fade effect

### Position
- **Mobile**: Bottom of screen, full width with margins
- **Desktop**: Bottom-right corner, 384px width

## Usage

The component is automatically included in the app through the Providers component:

```tsx
// app/providers.tsx
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <PWAInstallPrompt />  {/* ← Automatically included */}
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
```

No additional setup required - it just works!

## Testing

### Desktop (Chrome/Edge)

1. Build and run production:
   ```bash
   yarn build
   yarn start
   ```

2. Open http://localhost:3000

3. Wait 2 seconds - install prompt should appear

4. Test behaviors:
   - Click "Install" → Should trigger native install dialog
   - Click "Not now" → Should hide and not reappear
   - Check localStorage → Should see `pwa-install-dismissed` key

### Mobile

1. Deploy to HTTPS URL

2. Open in Chrome/Edge on mobile

3. Install prompt should appear after 2 seconds

4. Test same behaviors as desktop

## Browser Support

| Browser | Install Prompt | Native Dialog |
|---------|---------------|---------------|
| Chrome Desktop | ✅ Yes | ✅ Yes |
| Chrome Android | ✅ Yes | ✅ Yes |
| Edge Desktop | ✅ Yes | ✅ Yes |
| Edge Android | ✅ Yes | ✅ Yes |
| Samsung Internet | ✅ Yes | ✅ Yes |
| Safari iOS | ⚠️ No* | Manual only |
| Firefox | ⚠️ Limited | Android only |

**Note**: Safari iOS doesn't support `beforeinstallprompt`, so users must manually add via Share → Add to Home Screen. The component gracefully handles this by not showing on unsupported browsers.

## Customization

### Adjust Delay Time

Change the delay before showing the prompt:

```typescript
// In PWAInstallPrompt.tsx
setTimeout(() => {
  setShowPrompt(true);
}, 2000); // Change from 2000ms (2 seconds) to desired value
```

### Adjust Dismissal Period

Change how long to wait before showing again after dismissal:

```typescript
// In PWAInstallPrompt.tsx
if (daysSinceDismissed < 7) { // Change from 7 days
  return;
}
```

### Customize Appearance

The component uses Tailwind classes with your design system variables:
- `bg-card` - Card background
- `border-primary` - Primary color border
- `text-primary` - Primary text color
- `bg-primary` - Primary button background

Modify in `src/components/PWAInstallPrompt.tsx`

## localStorage Keys

| Key | Value | Purpose |
|-----|-------|---------|
| `pwa-install-dismissed` | ISO 8601 timestamp | Tracks when user dismissed the prompt |

**Example**: `"2025-11-20T10:30:00.000Z"`

## Accessibility

### ARIA Labels
- Dismiss button has `aria-label="Dismiss"`
- All interactive elements keyboard accessible

### Screen Readers
- Clear hierarchical structure
- Semantic HTML with proper headings
- Descriptive button text

### Keyboard Navigation
- Tab through buttons
- Enter/Space to activate
- Escape to dismiss (add if needed)

## Edge Cases Handled

### ✅ Already Installed
- Prompt never shows if app is already installed
- Detects via `display-mode: standalone`

### ✅ Unsupported Browsers
- Prompt never shows on browsers without `beforeinstallprompt`
- Gracefully degrades (Safari, Firefox desktop)

### ✅ User Previously Dismissed
- Respects dismissal for 7 days
- Automatically resets after period

### ✅ Multiple Tabs
- Each tab manages prompt independently
- Installation detected across all tabs via `appinstalled` event

### ✅ Repeated Visits
- Dismissal persists across sessions
- Installation status checked on each visit

## Performance

- **Bundle Size**: ~2KB (minified + gzipped)
- **Runtime Cost**: Minimal (event listeners only)
- **Memory**: Negligible (small state + localStorage)
- **No Impact**: Doesn't affect page load speed

## Future Enhancements

Potential improvements:

1. **A/B Testing**: Track install conversion rates
2. **Custom Timing**: Show after user engagement (e.g., after creating first todo)
3. **iOS Instructions**: Show manual install guide for Safari
4. **Animated Icon**: Add subtle animation to draw attention
5. **Analytics Integration**: Track prompt impressions and conversions
6. **Personalization**: Different messages based on device type

## Troubleshooting

### Prompt Not Showing?

**Check:**
1. ✅ App built for production (`yarn build`)
2. ✅ Running on HTTPS or localhost
3. ✅ Valid manifest.json exists
4. ✅ Service worker registered
5. ✅ Not already installed
6. ✅ Not dismissed within last 7 days
7. ✅ Using supported browser (Chrome/Edge)

**Debug:**
```javascript
// Add to PWAInstallPrompt.tsx for debugging
console.log('Deferred prompt:', deferredPrompt);
console.log('Show prompt:', showPrompt);
console.log('Is installed:', isInstalled);
```

### Prompt Shows But Install Doesn't Work?

**Check:**
1. Browser console for errors
2. All PWA criteria met (manifest, SW, icons)
3. HTTPS in production
4. Icons accessible at specified paths

### localStorage Not Working?

**Check:**
1. Browser allows localStorage
2. Not in private/incognito mode
3. localStorage quota not exceeded

## Related Documentation

- [PWA_SETUP.md](../PWA_SETUP.md) - PWA configuration guide
- [PWA_IMPLEMENTATION_SUMMARY.md](../PWA_IMPLEMENTATION_SUMMARY.md) - Implementation details
- [MDN: beforeinstallprompt](https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent)
- [Web.dev: Patterns for promoting PWA installation](https://web.dev/promote-install/)

---

**Last Updated**: November 20, 2025  
**Status**: ✅ Production Ready  
**Component**: `src/components/PWAInstallPrompt.tsx`

