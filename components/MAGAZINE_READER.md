# MagazineReader Component

A high-performance, realistic magazine page flip component for React with smooth 60fps animations, touch gestures, and responsive design.

## Features

✨ **Realistic Page Turn Animation**
- 3D page flip effect that mimics physical magazines
- Smooth transitions with custom easing curves
- Subtle page curl and shadow effects
- Spine shadow between spread pages

📱 **Multiple Interaction Methods**
- Click/tap on page edges (left 30% or right 30%)
- Swipe left/right on touch devices
- Keyboard arrow keys (← →)
- Direct navigation via progress dots
- Navigation buttons with hover effects

📐 **Responsive Design**
- Spread view (two pages) on desktop (≥1024px)
- Single page view on mobile and tablets
- Automatic layout adjustments
- Touch-optimized for mobile devices

⚡ **Performance Optimized**
- 60fps animations using Framer Motion
- Smart page preloading (adjacent pages)
- Lazy loading for non-visible pages
- Hardware-accelerated transforms
- Minimal re-renders

🎨 **Beautiful UI**
- Glassmorphism effects
- Ambient lighting
- Smooth progress indicator
- Page numbers
- Customizable styling

## Installation

The component uses Framer Motion, which is already included in the project's import map:

```html
<script type="importmap">
{
  "imports": {
    "framer-motion": "https://esm.sh/framer-motion@^11.0.0"
  }
}
</script>
```

## Usage

### Basic Usage

```tsx
import MagazineReader from './components/MagazineReader';

function App() {
  const pages = [
    '/images/cover.jpg',
    '/images/page1.jpg',
    '/images/page2.jpg',
    '/images/page3.jpg',
    // ... more pages
  ];

  return (
    <MagazineReader
      pages={pages}
      title="My Magazine"
    />
  );
}
```

### With Close Handler

```tsx
import { useState } from 'react';
import MagazineReader from './components/MagazineReader';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Magazine
      </button>

      {isOpen && (
        <MagazineReader
          pages={magazinePages}
          title="Folio Magazine"
          onClose={() => setIsOpen(false)}
          initialPage={0}
        />
      )}
    </>
  );
}
```

### With Custom Initial Page

```tsx
<MagazineReader
  pages={pages}
  title="Start from Page 5"
  initialPage={4} // Zero-indexed
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pages` | `string[]` | **Required** | Array of page image URLs |
| `title` | `string` | `'Magazine'` | Magazine title shown in header |
| `onClose` | `() => void` | `undefined` | Callback when close button is clicked |
| `initialPage` | `number` | `0` | Initial page index (zero-indexed) |

## Navigation Methods

### Click/Tap on Edges
- Click the **left 30%** of the page to go to previous page
- Click the **right 30%** of the page to go to next page
- Works on both desktop and mobile

### Swipe Gestures
- Swipe **right** to go to previous page
- Swipe **left** to go to next page
- Threshold: 50px
- Natural drag feel with spring physics

### Keyboard
- **Arrow Left (←)**: Previous page
- **Arrow Right (→)**: Next page
- **Escape (Esc)**: Close reader (if `onClose` is provided)

### Progress Dots
- Click any dot to jump to that page/spread
- Active page/spread is highlighted in blue
- Hover effect on inactive dots

### Navigation Buttons
- Chevron buttons on left and right sides
- Automatically hidden when at first/last page
- Hover animation (slight translate)

## Responsive Behavior

### Desktop (≥1024px)
- **Spread View**: Shows two pages side by side
- First page (cover) shown alone
- Subsequent pages shown in pairs (odd + even)
- Flipping moves by 2 pages at a time
- Progress indicator shows spreads, not individual pages

### Mobile (<1024px)
- **Single Page View**: Shows one page at a time
- Flipping moves by 1 page at a time
- Progress indicator shows individual pages
- Optimized touch targets

## Page Preloading

The component intelligently preloads adjacent pages for instant flips:

### Mobile Mode
Preloads:
- Current page
- Previous page (if exists)
- Next page (if exists)

### Desktop Mode
Preloads:
- Current spread (2 pages)
- Previous spread (2 pages)
- Next spread (2 pages)

This ensures smooth, lag-free page turns even with large images.

## Visual Effects

### Page Shadows
- **Spine shadow**: Dark gradient in the center of spreads
- **Edge shadows**: Subtle shadows on inner edges (spine area)
- **Edge highlights**: Light gradients on outer edges
- **Depth effect**: Creates realistic book-like appearance

### Page Curl
- Subtle curl effect during flip animation
- Brightness change during rotation
- 3D perspective transform
- Custom easing curve for natural feel

### Animations
- **Page flip**: 800ms with custom cubic-bezier easing
- **Drag gesture**: Spring physics for natural feel
- **Progress dots**: 300ms smooth transitions
- **Buttons**: Transform and opacity transitions

## Performance

### 60fps Target
- Uses `transform3d` for hardware acceleration
- `will-change` optimization
- Minimal repaints and reflows
- Efficient React re-renders

### Image Optimization
- Lazy loading for non-preloaded pages
- Eager loading for preloaded pages
- Native browser image caching
- Progressive loading support (via `<img>` element)

### Best Practices
1. Use optimized images (WebP recommended)
2. Provide images at appropriate resolutions:
   - Desktop: ~800x1120px per page
   - Mobile: ~600x840px per page
3. Consider using responsive images with `srcset`
4. Host images on a CDN for faster loading

## Customization

### Styling
The component uses Tailwind CSS classes. You can customize by:

1. **Overriding CSS variables**: Modify the component's inline styles
2. **Extending Tailwind**: Add custom colors/spacing to your Tailwind config
3. **Modifying the component**: Edit `MagazineReader.tsx` directly

### Example: Custom Page Dimensions

```tsx
// In MagazineReader.tsx, modify these lines:
style={{
  width: isMobile ? '90vw' : 'min(50vh * 0.7, 500px)',
  height: isMobile ? 'calc(90vw * 1.4)' : 'min(50vh, 700px)',
}}
```

### Example: Custom Animation Timing

```tsx
// In MagazineReader.tsx, modify transition:
transition={{
  duration: 1.2, // Slower flip
  ease: [0.6, 0.01, 0.05, 0.95] // Custom easing
}}
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS 12+)
- ✅ Chrome Mobile (Android)

**Required features:**
- CSS 3D Transforms
- CSS Grid/Flexbox
- ES6+ JavaScript
- Touch Events (for mobile)

## Demo

Access the demo at: `http://localhost:5173/#demo`

Or use the standalone demo component:

```tsx
import MagazineReaderDemo from './components/MagazineReaderDemo';

function App() {
  return <MagazineReaderDemo />;
}
```

## Architecture

### Component Structure
```
MagazineReader/
├── State Management
│   ├── currentPage (pagination)
│   ├── isFlipping (animation lock)
│   ├── isMobile (responsive detection)
│   └── loadedImages (preloading cache)
├── Effects
│   ├── Responsive detection
│   ├── Page preloading
│   └── Keyboard listeners
├── Handlers
│   ├── goToNextPage()
│   ├── goToPrevPage()
│   ├── handleDragEnd()
│   └── handlePageClick()
└── Render
    ├── Header (title, close button)
    ├── Main area (pages with animation)
    ├── Navigation (buttons, keyboard)
    └── Progress indicator
```

### State Flow
```
User Action → Handler → Update State → Trigger Animation → Update UI
      ↓
  Preload adjacent pages
```

## Troubleshooting

### Images not loading
- Check image URLs are accessible
- Verify CORS headers if images are on different domain
- Check browser console for 404 errors

### Laggy animations
- Reduce image file sizes
- Check for other heavy JavaScript on the page
- Verify hardware acceleration is enabled in browser
- Try disabling browser extensions

### Touch gestures not working
- Ensure device supports touch events
- Check for conflicting touch handlers
- Verify Framer Motion is loaded correctly

### Pages not preloading
- Check browser console for errors
- Verify image URLs are correct
- Check network tab for failed requests

## Examples

### E-commerce Catalog

```tsx
const catalogPages = products.map(product => product.imageUrl);

<MagazineReader
  pages={catalogPages}
  title="Spring 2024 Catalog"
  onClose={() => router.push('/shop')}
/>
```

### Photo Album

```tsx
const photos = [
  '/albums/wedding/cover.jpg',
  ...weddingPhotos.map(p => p.url)
];

<MagazineReader
  pages={photos}
  title="Our Wedding Day"
  initialPage={0}
/>
```

### Digital Brochure

```tsx
<MagazineReader
  pages={[
    '/brochure/cover.pdf.jpg',
    '/brochure/page1.pdf.jpg',
    '/brochure/page2.pdf.jpg',
    // ... converted PDF pages
  ]}
  title="Company Brochure 2024"
/>
```

## Future Enhancements

Potential features for future versions:
- [ ] Zoom in/out functionality
- [ ] Double-page spread for landscape images
- [ ] Bookmark functionality
- [ ] Full-screen mode
- [ ] Page thumbnails sidebar
- [ ] Search within pages (with OCR)
- [ ] Annotations and highlights
- [ ] Audio narration sync
- [ ] Multi-language support
- [ ] Right-to-left reading mode

## License

Part of the Folio project. See main project LICENSE.

## Credits

Built with:
- [React](https://react.dev/) - UI framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide React](https://lucide.dev/) - Icons
