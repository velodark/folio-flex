<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Folio — AI Interactive Magazine Builder

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/15DR2Y8iZz4pILFiNaT3RIRAjm5uf8oqS

## Features

✨ **AI-Powered Magazine Creation** - Create beautiful magazines with AI assistance
📖 **Magazine Page Flip Reader** - Realistic page turn animation with 60fps performance
🎨 **Interactive Elements** - Add hotspots, links, and interactive content
📱 **Responsive Design** - Works beautifully on desktop and mobile

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Magazine Reader Demo

Try the new magazine page flip component:

```bash
npm run dev
```

Then navigate to: **http://localhost:5173/#demo**

### Features:
- 🔄 Realistic 3D page flip animation
- 📱 Touch/swipe gestures for mobile
- ⌨️ Keyboard navigation (arrow keys)
- 🖱️ Click page edges to flip
- 📐 Spread view on desktop, single page on mobile
- ⚡ Smart page preloading for instant flips
- 🎯 60fps smooth animations

See [components/MAGAZINE_READER.md](components/MAGAZINE_READER.md) for detailed documentation.
