# Product Requirements Document (PRD)

## Folio — AI Interactive Magazine Builder

**Version:** 1.0
**Last Updated:** December 31, 2025
**Status:** Active Development

---

## Executive Summary

Folio is an AI-powered interactive magazine builder that transforms static content into immersive, interactive digital publications. The platform combines cutting-edge AI technology with an intuitive visual editor to enable creators to design, enhance, and publish beautiful magazines with realistic page-flip animations and interactive elements—all without coding.

**Core Value Proposition:**
- Transform PDFs and raw content into interactive magazines in minutes
- Leverage Google Gemini AI for intelligent layout design, image generation, and content enhancement
- Deliver realistic magazine reading experiences with 60fps 3D page-flip animations
- Create engaging interactive elements (hotspots, links, page jumps) with visual tools

---

## Product Vision

To democratize magazine publishing by providing creators, marketers, and publishers with an AI-first platform that eliminates the technical barriers to creating professional, interactive digital publications.

---

## Target Audience

### Primary Users
1. **Digital Publishers** - Magazine publishers transitioning from print to digital
2. **Content Creators** - Bloggers, influencers creating visual portfolios
3. **Marketing Teams** - Creating interactive product catalogs and brochures
4. **E-commerce Brands** - Building lookbooks and seasonal catalogs
5. **Educational Institutions** - Publishing interactive course materials

### User Personas

**Persona 1: Sarah - Marketing Director**
- Needs to create quarterly product catalogs quickly
- Has existing PDF designs but wants to add interactivity
- Limited design experience but strong content expertise
- Values: Speed, professional output, easy updates

**Persona 2: Alex - Independent Publisher**
- Publishes monthly digital magazines
- Wants to stand out with interactive features
- Comfortable with design tools but not coding
- Values: Creative control, reader engagement, distribution

---

## Core Features

### 1. Onboarding & Magazine Creation

#### 1.1 Dual Creation Modes

**Fresh Canvas Mode**
- Start from scratch with AI-assisted layout generation
- Input raw text content (articles, descriptions, etc.)
- Select from style presets: Editorial, Bold, Minimal, Warm
- AI analyzes content and generates 2-3 initial magazine pages
- Automatic layout suggestions based on content structure

**Interactive PDF Mode**
- Upload existing PDF files (single page or spreads)
- Automatic spread detection and page splitting
- Processes up to 100 pages per document
- Intelligent page-by-page rendering at 2x resolution
- Landscape and portrait format support
- Maintains aspect ratio consistency across pages

#### 1.2 Configuration

**Publication Settings**
- Custom magazine title
- Style preset selection (Editorial, Bold, Minimal, Warm)
- Brand kit initialization

**File Processing**
- PDF upload with drag-and-drop interface
- File size display and validation
- Real-time processing status updates
- Error handling with graceful degradation

**Technical Specifications:**
- Supported formats: PDF (application/pdf)
- Recommended page sizes: 17"x11" spreads, 8.5"x11" single pages
- Maximum file size: Not explicitly limited (handles large files)
- Processing time: ~1-2 seconds per page

---

### 2. Visual Editor

#### 2.1 Workspace Layout

**Sidebar - Spread Management**
- Visual thumbnail preview of all spreads
- Click-to-navigate between spreads
- "New Spread" creation button
- Collapsible sidebar for expanded canvas
- Active spread highlighting
- Cover page indicator

**Main Canvas - Editing Stage**
- 3D perspective view with realistic depth
- Zoom controls (30% - 150%)
- Spread or single-page view (responsive to aspect ratio)
- Realistic spine shadow between pages
- Edge shading and depth effects
- Drag-and-drop element positioning

**Floating Toolbar**
- Quick-add buttons for elements:
  - Headline (large display text)
  - Copy (body text)
  - Asset (images)
  - Action (interactive hotspots)
- "Magic Logic" AI suggestions button
- Glassmorphic design with backdrop blur

**Property Inspector Panel**
- Slides out from right side
- Context-sensitive to selected element
- Collapsible to maximize canvas space
- Real-time element editing
- Interactive action configuration
- AI creative tools integration

#### 2.2 Element Types

**Headlines**
- Large display typography
- Brand kit heading font application
- Full text editing in inspector
- Drag-and-drop positioning and resizing
- Uppercase, bold, tracking-tight styling
- Position defined as percentages (x, y, width, height)

**Text (Copy)**
- Body text elements
- Brand kit body font application
- Multi-line support
- Paragraph editing in textarea
- Medium weight, relaxed leading
- Flexible sizing and positioning

**Images**
- URL-based image loading
- Object-cover sizing
- Drag-and-drop positioning
- Aspect ratio preservation
- Visual preview in inspector
- Supports: JPG, PNG, WebP formats
- Hover zoom effect (5s duration scale animation)

**Hotspots (Interactive Actions)**
- Visual indicator with icon and label
- Dashed border preview in edit mode
- Configurable click actions:
  - **Page Jump**: Navigate to specific spread
  - **External Link**: Open URL in new tab
  - **Reveal**: Future feature placeholder
- Visual spread picker for page navigation
- Blue highlight on hover
- Pulse animation to draw attention

**Videos** (Future/Experimental)
- Generated via AI (Veo integration)
- Full-screen playback modal
- Auto-play support

#### 2.3 Editing Capabilities

**Element Manipulation**
- Click-to-select elements
- Drag-and-drop repositioning
- Real-time position updates
- Visual selection indicators (blue outline, shadow)
- Multi-element support on single page
- Z-index management (selected elements on top)

**Content Editing**
- Inline text editing via inspector
- Image URL updates
- Hotspot label customization
- Action configuration
- Font family inheritance from brand kit

**Undo/Redo System**
- 20-level history stack
- State snapshot on every change
- Visual undo button in header
- Disabled state when history is empty
- Complete magazine state restoration

**Background Management**
- Page background images from PDF import
- Full-bleed background support
- 100% coverage, no-repeat
- Maintains aspect ratio

#### 2.4 AI-Powered Features

**Magic Logic - Smart Suggestions**
- Analyzes PDF page backgrounds
- Identifies interactive regions:
  - Buttons and CTAs
  - External links
  - Table of contents entries
  - Product highlights
- Suggests hotspot placement with coordinates
- One-at-a-time suggestion workflow
- Accept/Reject interface with thumbs up/down
- Automatic action type detection (page jumps vs external links)

**Creative AI Engine**
- Context-aware based on selected element
- Freeform text prompt input
- Three AI operations:

  **1. Edit Image**
  - Modifies existing image element
  - Uses Gemini Flash Image model
  - Instruction-based editing
  - Returns base64 PNG result

  **2. Generate Image**
  - Creates new image from text prompt
  - Uses Gemini Pro Image (paid tier)
  - Configurable aspect ratio (default 1:1)
  - 1K resolution output
  - Auto-adds as new element on canvas

  **3. Animate (Video)**
  - Converts image to video
  - Uses Veo 3.1 Fast model
  - 720p resolution, 16:9 aspect ratio
  - Progress polling with 10s intervals
  - Full-screen video preview modal
  - Downloads and creates object URL

**API Key Management**
- Integration with AI Studio
- Paid tier feature detection
- Automatic key selection prompt
- Seamless key validation

---

### 3. Magazine Preview & Reading Experience

#### 3.1 Reader Interface

**Full-Screen Preview Mode**
- Immersive black background (slate-950)
- Centered magazine display
- 3D perspective rendering (3500px perspective)
- Glassmorphic HUD overlays
- Exit to editor button

**Header HUD**
- Magazine title display
- Current spread indicator (e.g., "Spread 2 of 5")
- Close button (returns to editor)
- Translucent backdrop blur
- Fixed positioning

**Navigation System**
- **Triangular Edge Buttons**: Left/Right arrows with clip-path triangle design
- **Keyboard Support**: Arrow keys for prev/next
- **Progress Indicator**: Dot navigation at bottom
  - Active spread: Blue, elongated (12px wide)
  - Inactive spreads: Gray, small (4px wide)
  - Click-to-jump to any spread
- **Auto-disable**: Buttons hide at first/last page

#### 3.2 Page Flip Animation

**Animation Specifications**
- **Duration**: 1000ms (1 second)
- **Easing**: cubic-bezier(0.645, 0.045, 0.355, 1)
- **Transform Origin**: Center
- **States**:
  - **Active**: Flat, 0° rotation, full opacity, centered
  - **Past**: Rotated -180° (flipped left), 0 opacity, scaled 90%
  - **Future**: Rotated +180° (waiting right), 0 opacity, scaled 90%
- **Locking**: Animation state prevents rapid flipping
- **Perspective**: 3D transforms with preserve-3d
- **Backface**: Hidden to prevent visual artifacts

**Visual Effects**
- **Spine Shadow**: Centered vertical gradient (2px width, 40px blur)
- **Page Shadows**: Inner edge gradients (black/5-20%, 32px width)
- **Depth Gradients**: Outer edge lightening (10px width)
- **Scale Animation**: Inactive pages shrink to 90% for depth perception

**Performance**
- Target: 60fps during animation
- Hardware acceleration via transform3d
- Minimal repaints
- CSS transitions (no JavaScript animation loop)

#### 3.3 Interactive Elements in Preview

**Hotspot Interactions**
- Hover reveals blue ring (ring-2)
- Click triggers configured action
- Scale-down animation on click (active:scale-95)
- Zap icon appears in blue circle on hover
- Background transparency (blue-500/0 → blue-500/10)

**Page Jump Navigation**
- Smooth spread transition on hotspot click
- Updates progress indicator
- Respects animation lock
- Scroll-into-view behavior in editor mode

**External Links**
- Opens in new tab/window
- Preserves reader state

#### 3.4 Responsive Behavior

**Desktop (Landscape)**
- Two-page spread view (except cover)
- Navigation by spread pairs
- Click edge of pages to flip

**Mobile/Portrait**
- Single page view
- Individual page navigation
- Touch-friendly controls

---

### 4. Brand Kit & Styling

#### 4.1 Brand Kit System

**Color Palette**
- **Primary Color**: Main brand color
- **Secondary Color**: Supporting color
- **Accent Color**: Highlights and CTAs

**Typography**
- **Heading Font**: Applied to headlines
- **Body Font**: Applied to text elements and page backgrounds
- Inherit from magazine-level brand kit
- Element-level font family override support

**Logo** (Future)
- Logo URL storage in brand kit
- Planned: Logo placement tools

**Initial Brand Kit (Default)**
```typescript
{
  primaryColor: '#3b82f6',    // Blue
  secondaryColor: '#1e293b',  // Slate
  accentColor: '#f59e0b',     // Amber
  headingFont: 'Inter',       // Sans-serif
  bodyFont: 'Inter'           // Sans-serif
}
```

#### 4.2 Style Presets

**Editorial**
- Classic magazine aesthetic
- Balanced typography
- Traditional layouts
- Professional tone

**Bold**
- High-contrast designs
- Strong typography
- Dynamic layouts
- Modern aesthetic

**Minimal**
- Clean, spacious layouts
- Subtle typography
- Generous white space
- Sophisticated simplicity

**Warm**
- Organic color palettes
- Friendly typography
- Approachable layouts
- Inviting aesthetic

---

### 5. Data Model & Architecture

#### 5.1 Type Definitions

**Magazine**
```typescript
{
  id: string              // Unique identifier (timestamp-based)
  title: string           // Publication name
  pages: Page[]           // Array of page objects
  brandKit: BrandKit      // Styling configuration
  style: 'editorial' | 'bold' | 'minimal' | 'warm'
  aspectRatio: number     // width/height of single page
}
```

**Page**
```typescript
{
  id: string              // Unique identifier
  elements: MagazineElement[]  // Array of content elements
  background?: string     // Base64 image or URL
}
```

**MagazineElement**
```typescript
{
  id: string              // Unique identifier
  type: 'text' | 'image' | 'hotspot' | 'video' | 'headline'
  x: number               // Position % (0-100)
  y: number               // Position % (0-100)
  width: number           // Size % (0-100)
  height: number          // Size % (0-100)
  content: string         // Text, URL, or label
  style?: object          // Custom CSS properties
  animation?: 'fade' | 'parallax' | 'slide-up' | 'none'
  action?: {
    type: 'link' | 'page' | 'reveal'
    value: string         // URL or page index
  }
  isSuggestion?: boolean  // AI-suggested element flag
}
```

**BrandKit**
```typescript
{
  primaryColor: string    // Hex color
  secondaryColor: string  // Hex color
  accentColor: string     // Hex color
  headingFont: string     // Font family name
  bodyFont: string        // Font family name
  logo?: string           // URL (future)
}
```

#### 5.2 State Management

**View Modes**
- `onboarding`: Initial creation flow
- `editor`: Main editing workspace
- `preview`: Full-screen reader mode
- `demo`: Standalone demo component

**Editor State**
- Current spread index
- Selected element ID
- Active page index (within spread)
- Zoom level (0.3 - 1.5)
- Inspector visibility
- Sidebar collapsed state
- History stack (20 levels)
- AI loading states
- Pending suggestions queue

**Preview State**
- Current spread index
- Animation lock flag
- Container dimensions
- Scale calculations

---

### 6. Technical Implementation

#### 6.1 Technology Stack

**Frontend Framework**
- **React** 19.2.3 - UI library
- **TypeScript** 5.8.2 - Type safety
- **Vite** 6.2.0 - Build tool and dev server

**AI Integration**
- **@google/genai** 1.34.0 - Google Gemini API client
- Models used:
  - `gemini-3-flash-preview` - Layout analysis, content generation
  - `gemini-2.5-flash-image` - Image editing
  - `gemini-3-pro-image-preview` - High-quality image generation (paid)
  - `veo-3.1-fast-generate-preview` - Video generation (paid)

**PDF Processing**
- **pdfjs-dist** 4.0.379 - PDF.js library
- Worker: `pdf.worker.mjs` from esm.sh CDN
- Canvas-based rendering at 2x scale
- Spread detection via aspect ratio analysis (width > height * 1.1)

**UI & Styling**
- **Tailwind CSS** - Utility-first styling
- **Lucide React** 0.562.0 - Icon library
- Custom CSS for 3D animations
- Glassmorphism effects

**Icons Used**
- Zap, Monitor, Download, Prev, Next, ArrowRight
- Text, Layers, Image, Hotspot, Sparkles
- Trash, Undo, Plus, ThumbsUp, ThumbsDown

#### 6.2 Performance Optimizations

**Canvas Rendering**
- 2.0 scale for PDF rendering (balance of quality/performance)
- High-quality image smoothing
- 0.95 PNG compression for base64 output
- Progressive page processing with status updates

**Animation Performance**
- CSS transforms (hardware-accelerated)
- `transform-style: preserve-3d`
- `backface-visibility: hidden`
- `will-change` hints
- Minimal JavaScript in animation loop
- 60fps target with cubic-bezier easing

**Lazy Loading**
- Page elements rendered only when in view
- AI operations run on-demand
- Image loading via browser native lazy loading

**State Optimization**
- JSON.parse/stringify for history snapshots (deep clones)
- Selective re-renders via React state
- Event listener cleanup

#### 6.3 Responsive Design

**Breakpoints**
- Mobile: < 1024px (single page view)
- Desktop: ≥ 1024px (spread view)
- Media query: `@media (min-width: 1024px)`

**Adaptive Layouts**
- Sidebar: 64px (collapsed) → 256px (expanded)
- Toolbar: Responsive text sizes (text-[9px] → text-xs)
- Canvas: Auto-scaling based on container width
- Touch targets: Optimized for mobile (larger tap areas)

**Device Support**
- Desktop: Chrome, Firefox, Safari, Edge (latest)
- Mobile: iOS Safari 12+, Chrome Mobile
- Tablet: Full support with touch gestures

---

### 7. User Workflows

#### 7.1 Creating a Magazine from PDF

1. **Launch Onboarding**
   - User lands on onboarding screen
   - Sees two options: "Fresh Canvas" and "Interactive PDF"

2. **Select PDF Mode**
   - User clicks "Interactive PDF"
   - Advances to configuration step (step 2)

3. **Configure Publication**
   - Enters magazine title (auto-fills from PDF filename)
   - Clicks drag-and-drop zone to upload PDF
   - Sees file size and name confirmation

4. **Start Processing**
   - Clicks "Start Designing" button
   - AI status updates show progress:
     - "Opening document for processing..."
     - "Converting Page 1 of 10..."
     - "Converting Page 2 of 10..." (etc.)

5. **Enter Editor**
   - Magazine loads with all pages converted
   - Each PDF page becomes a page with background image
   - No elements initially (blank canvas over PDF)

6. **Add Interactivity**
   - User navigates to desired spread
   - Clicks "Magic Logic" to get AI suggestions
   - AI analyzes page and suggests hotspots
   - User accepts/rejects suggestions one-by-one
   - Or manually adds elements via toolbar

7. **Configure Actions**
   - Selects hotspot element
   - Opens inspector panel
   - Sets action type (Page Jump or Link)
   - Uses spread picker to select target page
   - Repeats for other hotspots

8. **Preview**
   - Clicks "Preview" button in header
   - Views magazine in full-screen reader
   - Tests page flips and interactive elements
   - Clicks "Close" to return to editor

9. **Publish** (Future)
   - Clicks "Publish" button
   - Exports magazine for distribution

#### 7.2 Creating a Magazine from Scratch

1. **Launch Onboarding**
   - User lands on onboarding screen

2. **Select Fresh Canvas**
   - User clicks "Fresh Canvas"
   - Advances to configuration step

3. **Configure Publication**
   - Enters magazine title
   - Pastes article text or content in textarea
   - Selects style preset (Editorial, Bold, Minimal, Warm)

4. **AI Layout Generation**
   - Clicks "Start Designing"
   - AI status: "AI Designer is conceptualizing layouts..."
   - Gemini Flash analyzes content and generates 2-3 pages
   - Each page includes suggested elements (headlines, text, images)

5. **Refine in Editor**
   - Auto-generated pages load in editor
   - User repositions elements via drag-and-drop
   - Edits text content in inspector
   - Replaces placeholder images with custom URLs or AI-generated images

6. **Enhance with AI**
   - Selects image element
   - Enters prompt in Creative AI Engine
   - Clicks "Generate" to create new image
   - Or clicks "Edit" to modify existing image
   - Or clicks "Animate" to create video from image

7. **Add More Pages**
   - Clicks "New Spread" button in sidebar
   - Blank page added to magazine
   - User adds elements via toolbar

8. **Preview & Publish**
   - Same as PDF workflow

---

### 8. AI Integration Details

#### 8.1 Gemini Flash (gemini-3-flash-preview)

**Use Cases**
- Content layout analysis
- PDF page hotspot detection
- Table of contents parsing
- Spread detection (single vs 2-page)

**Input Formats**
- Text prompts
- Base64 images (PNG, JPEG)
- Combined multimodal inputs

**Output Formats**
- Structured JSON (via responseSchema)
- Plain text responses
- Type-safe schemas with Zod-like validation

**Configuration**
- `thinkingBudget: 0` for faster responses
- `responseMimeType: "application/json"`
- Detailed type definitions for arrays/objects

**Example: Hotspot Detection**
```typescript
{
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      type: { type: Type.STRING, enum: ['hotspot'] },
      x: { type: Type.NUMBER },
      y: { type: Type.NUMBER },
      width: { type: Type.NUMBER },
      height: { type: Type.NUMBER },
      content: { type: Type.STRING },
      action: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['page', 'link'] },
          value: { type: Type.STRING }
        }
      }
    }
  }
}
```

#### 8.2 Gemini Flash Image (gemini-2.5-flash-image)

**Use Case**
- Instruction-based image editing
- Modify existing images on canvas

**Input**
- Base64 image data
- Text instruction/prompt

**Output**
- Edited image as base64 PNG
- Returned in `inlineData` part of response

**Workflow**
1. User selects image element
2. Enters editing instruction in AI panel
3. Clicks "Edit" button
4. System sends current image + instruction to API
5. Receives edited image
6. Updates element content with new base64 URL

#### 8.3 Gemini Pro Image (gemini-3-pro-image-preview)

**Use Case**
- High-quality image generation from text prompts
- Professional-grade magazine imagery

**Paid Tier**
- Requires selected API key via AI Studio
- `ensurePaidApiKey()` checks and prompts for key
- `aistudio.hasSelectedApiKey()` validation
- `aistudio.openSelectKey()` key selection modal

**Configuration**
```typescript
imageConfig: {
  aspectRatio: '1:1',  // Options: 1:1, 16:9, 9:16, 4:3, 3:4
  imageSize: '1K'      // Options: 1K, 2K, 4K
}
```

**Output**
- High-resolution base64 PNG
- Automatically added as new image element

#### 8.4 Veo Video (veo-3.1-fast-generate-preview)

**Use Case**
- Animate static images into videos
- Create dynamic content from magazine images

**Paid Tier**
- Requires API key (same as Pro Image)

**Configuration**
```typescript
{
  numberOfVideos: 1,
  resolution: '720p',
  aspectRatio: '16:9'
}
```

**Workflow**
1. User selects image element
2. Enters animation instruction
3. Clicks "Animate" button
4. System initiates video generation operation
5. Polls operation status every 10 seconds
6. When `operation.done === true`, fetches video URI
7. Downloads video via authenticated fetch (API key in URL)
8. Converts blob to object URL
9. Displays in full-screen modal with video player

**Performance Considerations**
- Long-running operation (30s - 2min typical)
- Polling interval: 10 seconds
- No timeout (waits indefinitely)
- User remains in editor during generation

---

### 9. Page Flip Reader Component

#### 9.1 MagazineReader Component

**Standalone Component**
- Fully self-contained reader experience
- Can be used independently of editor
- Accessed via `#demo` URL hash

**Props Interface**
```typescript
{
  pages: string[]        // Array of image URLs
  title?: string         // Magazine title (default: 'Magazine')
  onClose?: () => void   // Callback for close button
  initialPage?: number   // Starting page index (default: 0)
}
```

#### 9.2 Demo Mode

**Access**
- URL: `http://localhost:5173/#demo`
- Shows `MagazineReaderDemo` component
- Pre-loaded sample magazine images

**Features Demonstrated**
- 3D page flip animations
- Touch/swipe gestures
- Keyboard navigation
- Click page edges to flip
- Progress indicator
- Spread view (desktop) vs single page (mobile)
- Smart page preloading

#### 9.3 Navigation Methods

**Click/Tap**
- Left 30% of page → Previous
- Right 30% of page → Next
- Center 40% → No action (content interaction)

**Swipe Gestures** (Touch Devices)
- Swipe right → Previous page
- Swipe left → Next page
- 50px threshold
- Spring physics for drag feel

**Keyboard**
- Arrow Left (←) → Previous
- Arrow Right (→) → Next
- Escape → Close reader (if `onClose` provided)

**Direct Navigation**
- Click progress dots at bottom
- Jump to any spread instantly
- Active spread highlighted in blue

**Navigation Buttons**
- Chevron buttons on left/right edges
- Auto-hide at first/last page
- Hover animation (slight translate)

#### 9.4 Responsive Spread Logic

**Desktop (≥1024px)**
- Spread view: 2 pages side-by-side
- First page (cover) shown alone
- Subsequent pages paired (odd + even)
- Flipping advances by 2 pages
- Progress indicator counts spreads

**Mobile (<1024px)**
- Single page view
- All pages shown individually
- Flipping advances by 1 page
- Progress indicator counts individual pages

#### 9.5 Page Preloading

**Mobile Preload Strategy**
- Current page (eager)
- Previous page (eager)
- Next page (eager)
- Others: Lazy

**Desktop Preload Strategy**
- Current spread (2 pages, eager)
- Previous spread (2 pages, eager)
- Next spread (2 pages, eager)
- Others: Lazy

**Implementation**
- Uses native `<img loading="eager">` attribute
- Browser handles caching
- Ensures instant page turns

---

### 10. Design System

#### 10.1 Color Palette

**Primary Colors**
- Slate 950: `#020617` - Primary dark backgrounds
- Slate 900: `#0f172a` - Secondary dark backgrounds
- Slate 800: `#1e293b` - Tertiary dark backgrounds
- White: `#ffffff` - Light backgrounds, text on dark

**Accent Colors**
- Blue 600: `#2563eb` - Primary actions, selected states
- Blue 500: `#3b82f6` - Hover states, highlights
- Blue 400: `#60a5fa` - Subtle accents
- Blue 50: `#eff6ff` - Light blue backgrounds

**Text Colors**
- Slate 900: `#0f172a` - Primary text
- Slate 800: `#1e293b` - Secondary text
- Slate 600: `#475569` - Tertiary text
- Slate 400: `#94a3b8` - Placeholder, disabled text
- White/10: `rgba(255,255,255,0.1)` - Subtle text on dark

**Semantic Colors**
- Red 500: `#ef4444` - Delete, reject actions
- Green 400: `#4ade80` - Success, active states
- Amber 500: `#f59e0b` - Warnings, accents (brand kit)

#### 10.2 Typography

**Font Families**
- **Primary**: Inter - Used for UI elements
- **Display**: "font-instrument" (italic) - Magazine titles, headings
- **Monospace**: System monospace - AI status messages

**Font Sizes**
- `text-[8px]` - Micro labels
- `text-[9px]` - Small labels, toolbar
- `text-[10px]` - Standard labels
- `text-xs` (12px) - Body small
- `text-sm` (14px) - Body medium
- `text-base` (16px) - Body standard
- `text-lg` (18px) - Lead text
- `text-xl` (20px) - Headings H4
- `text-2xl` (24px) - Headings H3
- `text-3xl` (30px) - Headings H2
- `text-4xl` (36px) - Headings H1
- `text-5xl` (48px) - Display text
- `text-6xl` (60px) - Magazine headlines (in elements)

**Font Weights**
- `font-light` (300) - Subtle text
- `font-medium` (500) - Body text
- `font-bold` (700) - Headings
- `font-black` (900) - Labels, micro text, uppercase

**Letter Spacing**
- `tracking-tight` - Headlines
- `tracking-tighter` - Display text
- `tracking-wide` - Small labels
- `tracking-widest` - Micro labels (0.3em)
- `tracking-[0.2em]` - Standard labels

#### 10.3 Spacing & Layout

**Border Radius**
- `rounded-sm` (2px) - Magazine pages
- `rounded-md` (6px) - Small elements
- `rounded-lg` (8px) - Medium elements
- `rounded-xl` (12px) - Inputs, buttons
- `rounded-2xl` (16px) - Cards, panels
- `rounded-[2rem]` (32px) - Large panels
- `rounded-[2.5rem]` (40px) - Inspector panel
- `rounded-[3rem]` (48px) - Onboarding panel
- `rounded-full` - Circular buttons, dots

**Shadows**
- `shadow-sm` - Subtle elevation
- `shadow-lg` - Medium elevation
- `shadow-xl` - High elevation
- `shadow-2xl` - Maximum elevation
- `shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]` - Custom toolbar shadow
- `shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)]` - Custom inspector shadow

**Transitions**
- `transition-all` - Default smooth transition
- `duration-300` - Standard (300ms)
- `duration-500` - Medium (500ms)
- `duration-700` - Slow (700ms)
- `cubic-bezier(0.6, -0.28, 0.735, 0.045)` - Page flip easing

#### 10.4 Effects

**Glassmorphism**
- `backdrop-blur-xl` - Strong blur (24px)
- `backdrop-blur-3xl` - Intense blur (64px)
- `bg-white/95` - Semi-transparent white
- `bg-black/40` - Semi-transparent black
- `border border-white/10` - Subtle borders

**Gradients**
- Radial blur circles on onboarding
- Linear edge shadows on magazine pages
- `from-black/20 via-black/5 to-transparent` - Spine shadows

**Animations**
- `animate-pulse` - AI status indicators
- `animate-spin` - Loading spinners
- `animate-in fade-in slide-in-from-*` - Entry animations
- `group-hover:*` - Hover state transforms

---

### 11. Future Enhancements

#### 11.1 Planned Features

**Short-term (Next 3 Months)**
- [ ] Export/Publish functionality
  - PDF export with interactive layer
  - Web hosting/embedding
  - Social media sharing
- [ ] Enhanced brand kit editor
  - Color picker interface
  - Font selection from library
  - Logo upload and placement
- [ ] Multi-user collaboration
  - Real-time co-editing
  - Comment system
  - Version history
- [ ] Templates library
  - Pre-designed magazine templates
  - Industry-specific layouts (fashion, food, tech)
  - Drag-and-drop template application

**Medium-term (3-6 Months)**
- [ ] Advanced AI features
  - Full magazine generation from topic prompt
  - Automatic image sourcing (stock integration)
  - Content summarization for long articles
  - Auto-generated table of contents
- [ ] Analytics & engagement tracking
  - Page view heatmaps
  - Click tracking on hotspots
  - Time spent per page
  - Reader journey visualization
- [ ] Asset management
  - Media library for uploaded images
  - Unsplash/Pexels integration
  - Asset organization and tagging
- [ ] Accessibility features
  - Screen reader support
  - Keyboard-only navigation
  - High-contrast mode
  - Text-to-speech narration

**Long-term (6+ Months)**
- [ ] Mobile app (iOS/Android)
  - Native reader experience
  - Offline reading
  - Push notifications for new issues
- [ ] Subscription & monetization
  - Paywall support
  - Subscription management
  - In-magazine purchases
- [ ] Advanced interactivity
  - Embedded forms
  - Polls and surveys
  - Mini-games and quizzes
  - Social comments and reactions
- [ ] E-commerce integration
  - Product tagging
  - Direct checkout
  - Inventory sync
  - Order tracking

#### 11.2 Technical Improvements

**Performance**
- [ ] Service worker for offline support
- [ ] Progressive image loading (blur-up)
- [ ] WebP/AVIF format support
- [ ] Lazy loading for off-screen spreads
- [ ] Virtual scrolling for 100+ page magazines

**Developer Experience**
- [ ] Headless API for programmatic access
- [ ] Webhook integration
- [ ] Custom domain support
- [ ] CDN integration for assets
- [ ] Automated testing suite

**Platform**
- [ ] Multi-language UI support
- [ ] Right-to-left reading mode
- [ ] Dark mode for editor
- [ ] Custom CSS injection
- [ ] Plugin/extension system

---

### 12. Success Metrics

#### 12.1 Product Metrics

**Adoption**
- New users per month
- Magazines created per user
- Conversion rate (onboarding → first published magazine)

**Engagement**
- Pages per magazine (average)
- Interactive elements per page (average)
- Time spent in editor per session
- Preview mode usage rate

**Retention**
- 7-day active users
- 30-day active users
- Monthly returning users
- Magazine update frequency

**AI Usage**
- Magic Logic acceptance rate
- AI image generation requests
- AI image edit requests
- Video generation requests

#### 12.2 Reader Metrics

**Reader Engagement**
- Average pages read per session
- Completion rate (read to last page)
- Hotspot click-through rate
- Time spent per page

**Performance**
- Page load time
- Time to first flip
- Animation frame rate
- Error rate

**Distribution**
- Views per published magazine
- Share rate (social, email)
- Embed usage
- Mobile vs desktop readership

---

### 13. Technical Architecture

#### 13.1 File Structure

```
folio-flex/
├── components/
│   ├── Editor.tsx                 # Main editor component
│   ├── Onboarding.tsx             # Creation wizard
│   ├── MagazineReader.tsx         # Standalone reader component
│   ├── MagazineReaderDemo.tsx     # Demo with sample content
│   └── MAGAZINE_READER.md         # Reader documentation
├── services/
│   └── geminiService.ts           # AI API integration
├── App.tsx                        # Main app component & router
├── types.ts                       # TypeScript type definitions
├── constants.tsx                  # Icons, style presets, defaults
├── index.tsx                      # React entry point
├── index.html                     # HTML shell
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies
└── README.md                      # Project documentation
```

#### 13.2 Component Hierarchy

```
App
├── Onboarding (view === 'onboarding')
│   ├── Step 1: Mode Selection
│   └── Step 2: Configuration
├── Editor (view === 'editor')
│   ├── Sidebar (Spread Management)
│   ├── Header (Navigation, Zoom, Preview)
│   ├── Canvas (Editing Stage)
│   │   ├── Spread Display
│   │   │   └── DraggableElement (repeated)
│   │   └── AI Suggestion Ghost
│   ├── Floating Toolbar
│   ├── Inspector Panel
│   │   ├── Content Editor
│   │   ├── Action Configuration
│   │   │   └── Spread Picker Overlay
│   │   └── Creative AI Engine
│   └── Video Preview Modal
├── Preview (view === 'preview')
│   ├── Header HUD
│   ├── Navigation Buttons
│   ├── Flip Animation Stage
│   │   └── Spreads with Elements
│   └── Progress Indicator
└── MagazineReaderDemo (view === 'demo')
```

#### 13.3 State Flow

```
User Action → Handler Function → State Update → React Re-render → UI Update
                                      ↓
                              History Stack Push
```

**Example: Adding an Element**
1. User clicks "Headline" in toolbar
2. `addElement('headline')` handler called
3. New element created with default properties
4. `updateMagazineState()` called
5. Previous state pushed to history stack
6. Magazine state updated with new element
7. `setSelectedElementId()` called
8. React re-renders canvas and inspector
9. New headline appears on canvas, selected

---

### 14. API Reference

#### 14.1 Gemini Service Functions

**`analyzeContentForLayout(rawText, images, style, brandKit)`**
- Generates 2-3 magazine pages from content
- Returns: `Promise<Page[]>`

**`processPdfPageWithAI(pageImageBase64)`**
- Analyzes PDF page for interactive regions
- Returns: `Promise<MagazineElement[]>` (hotspots)

**`editImageWithAI(base64Image, instruction)`**
- Edits existing image based on text instruction
- Returns: `Promise<string | null>` (base64 PNG)

**`generateProImage(prompt, aspectRatio, size)`**
- Generates new image from text prompt
- Returns: `Promise<string | null>` (base64 PNG)

**`generateVeoVideo(imagePrompt, base64Image?)`**
- Generates video from prompt and optional image
- Returns: `Promise<string | null>` (object URL)

**`detectPdfLayout(pageImageBase64)`** (Not actively used)
- Determines if PDF page is single or spread
- Returns: `Promise<'single' | 'spread'>`

---

### 15. Deployment & Infrastructure

#### 15.1 Development

**Prerequisites**
- Node.js (latest LTS)
- npm or yarn
- Gemini API key

**Setup**
```bash
npm install
# Set GEMINI_API_KEY in .env.local
npm run dev
# Open http://localhost:5173
```

**Demo Access**
- Main app: `http://localhost:5173`
- Reader demo: `http://localhost:5173/#demo`

#### 15.2 Build & Production

**Build Command**
```bash
npm run build
```

**Preview Build**
```bash
npm run preview
```

**Output**
- Static files in `dist/` directory
- Can be deployed to:
  - Vercel
  - Netlify
  - GitHub Pages
  - AI Studio (integrated platform)

#### 15.3 Environment Variables

**Required**
- `API_KEY` - Gemini API key (set in `.env.local` or platform env vars)

**Platform Integration**
- AI Studio API key selection (for paid features)
- Automatic key validation and prompts

---

### 16. Constraints & Limitations

#### 16.1 Current Limitations

**PDF Processing**
- Maximum 100 pages per PDF
- Large files may cause memory issues
- No OCR (text remains as image)
- No text extraction from PDF

**AI Features**
- Requires active internet connection
- Paid features need selected API key
- Video generation is slow (30s - 2min)
- Image generation has usage limits

**Browser Support**
- Requires modern browser (ES6+)
- CSS 3D transforms required
- No Internet Explorer support
- Limited offline functionality

**File Management**
- No persistent storage (in-memory only)
- No auto-save
- No cloud sync
- Refresh loses unsaved work

**Export**
- No PDF export yet
- No web hosting yet
- No embed code generation
- No sharing functionality

#### 16.2 Performance Constraints

**Large Magazines**
- 50+ pages may have performance issues
- High-resolution images increase memory usage
- Many elements per page slows editor

**Animation**
- 60fps target not guaranteed on low-end devices
- 3D transforms may be disabled on some mobile browsers
- Simultaneous video generation can block UI

**AI Operations**
- Sequential processing (one at a time)
- No batch operations
- Rate limiting by Google AI

---

### 17. Security & Privacy

#### 17.1 Data Handling

**User Content**
- All processing happens client-side
- No server-side storage of magazines
- Content sent to Google AI APIs for processing
- API keys managed via AI Studio integration

**API Keys**
- Not stored in code or repository
- Environment variable injection
- Platform-managed for paid features
- User must provide own key for local development

**PDF Files**
- Processed entirely in browser
- Converted to base64 images
- No server upload required
- File data remains in client memory

#### 17.2 AI Content

**Terms of Service**
- User responsible for content sent to AI
- Google AI terms apply to generated content
- No guarantee of content appropriateness
- User must review AI suggestions

**Content Moderation**
- No built-in content filtering
- Relies on Google AI safety filters
- Inappropriate content may be rejected by AI
- User responsibility to comply with usage policies

---

### 18. Support & Documentation

#### 18.1 Documentation

**README.md**
- Quick start guide
- Installation instructions
- Feature overview
- Demo access instructions

**MAGAZINE_READER.md**
- Detailed reader component docs
- Props API reference
- Navigation methods
- Customization guide
- Performance tips
- Browser support matrix

**Code Comments**
- Inline documentation for complex logic
- Type definitions with JSDoc
- Function descriptions

#### 18.2 Getting Help

**Issues & Feedback**
- GitHub Issues: https://github.com/anthropics/claude-code/issues
- Feature requests welcome
- Bug reports with reproduction steps
- Community discussions

**AI Studio**
- View app: https://ai.studio/apps/drive/15DR2Y8iZz4pILFiNaT3RIRAjm5uf8oqS
- Platform-specific support
- API key management

---

## Appendix A: Glossary

**Spread**: Two facing pages in a magazine (left and right)
**Hotspot**: Interactive element that triggers an action on click
**Brand Kit**: Collection of colors, fonts, and styling for a magazine
**Page Jump**: Navigation action that moves reader to a different spread
**Magazine Element**: Any content item on a page (text, image, hotspot)
**3D Page Flip**: Realistic page turn animation with perspective and rotation
**Gemini**: Google's generative AI platform
**Veo**: Google's video generation model
**PDF.js**: JavaScript library for rendering PDF files in browsers
**Glassmorphism**: Design style with frosted glass effect (blur + transparency)

---

## Appendix B: Change Log

**v1.0 (Current)**
- Initial release
- PDF import with spread detection
- Visual drag-and-drop editor
- AI-powered layout generation
- Image generation and editing
- Video generation (Veo)
- 3D page flip reader
- Interactive hotspots (page jumps, links)
- Brand kit system
- Style presets

**Previous Releases**
- PR #3: Magazine page flip component with realistic animations
- PR #2: Multiple bug fixes and codebase improvements
- PR #1: Initial project analysis and setup

---

## Appendix C: Credits

**Development Team**
- Built with Claude Code (Anthropic)
- AI-assisted development

**Technologies**
- React - Meta
- TypeScript - Microsoft
- Vite - Evan You
- Tailwind CSS - Tailwind Labs
- Google Gemini - Google DeepMind
- PDF.js - Mozilla
- Lucide Icons - Lucide Contributors

**Inspiration**
- Digital magazine publishing industry
- Interactive PDF readers
- Modern web design trends

---

**Document Version**: 1.0
**Last Updated**: December 31, 2025
**Next Review**: Q2 2026

