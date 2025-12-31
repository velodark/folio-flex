import React, { useState } from 'react';
import MagazineReader from './MagazineReader';
import { BookOpen, Sparkles } from 'lucide-react';

/**
 * Demo component for MagazineReader
 *
 * This component demonstrates the MagazineReader with placeholder magazine pages.
 * The placeholder images use picsum.photos for variety.
 */
const MagazineReaderDemo: React.FC = () => {
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  // Generate placeholder magazine pages
  // Using different seed values to get varied images
  const magazinePages = [
    'https://picsum.photos/seed/mag1/800/1120', // Cover
    'https://picsum.photos/seed/mag2/800/1120', // Page 1
    'https://picsum.photos/seed/mag3/800/1120', // Page 2
    'https://picsum.photos/seed/mag4/800/1120', // Page 3
    'https://picsum.photos/seed/mag5/800/1120', // Page 4
    'https://picsum.photos/seed/mag6/800/1120', // Page 5
    'https://picsum.photos/seed/mag7/800/1120', // Page 6
    'https://picsum.photos/seed/mag8/800/1120', // Page 7
    'https://picsum.photos/seed/mag9/800/1120', // Page 8
    'https://picsum.photos/seed/mag10/800/1120', // Page 9
    'https://picsum.photos/seed/mag11/800/1120', // Page 10
    'https://picsum.photos/seed/mag12/800/1120', // Back cover
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BookOpen size={48} className="text-blue-600" />
            <Sparkles size={32} className="text-yellow-500 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Magazine Page Flip
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-4">
            Realistic page turn animation for digital magazines
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Experience smooth 60fps animations, realistic page curls, and intuitive navigation.
            Click edges, swipe, or use arrow keys to flip through pages.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Touch & Swipe</h3>
            <p className="text-gray-600 text-sm">
              Natural swipe gestures on mobile and touch devices with smooth drag interactions
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Smart Preloading</h3>
            <p className="text-gray-600 text-sm">
              Adjacent pages are preloaded for instant flips with no lag or loading delays
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Responsive Design</h3>
            <p className="text-gray-600 text-sm">
              Spread view on desktop, single page on mobile - optimized for every screen size
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={() => setIsReaderOpen(true)}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105 active:scale-95"
          >
            <BookOpen size={24} />
            <span>Open Magazine Demo</span>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity -z-10" />
          </button>
        </div>

        {/* Technical Specs */}
        <div className="mt-20 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Features & Controls</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                Navigation Methods
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm ml-4">
                <li>• Click/tap on page edges (left/right 30%)</li>
                <li>• Swipe left/right on touch devices</li>
                <li>• Arrow keys (← →) for keyboard navigation</li>
                <li>• Progress dots for direct page access</li>
                <li>• Navigation buttons with visual feedback</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full" />
                Visual Effects
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm ml-4">
                <li>• Realistic 3D page flip animation</li>
                <li>• Subtle page curl shadows</li>
                <li>• Spine shadow between spread pages</li>
                <li>• Smooth 60fps transitions</li>
                <li>• Ambient lighting effects</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-3">Technical Stack</h3>
            <div className="flex flex-wrap gap-2">
              {['React 19', 'TypeScript', 'Framer Motion', 'Tailwind CSS', 'Lucide Icons'].map(tech => (
                <span key={tech} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-12 bg-slate-900 rounded-2xl p-8 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <span className="text-gray-400 text-sm ml-4">MagazineReader.tsx</span>
          </div>
          <pre className="text-sm text-gray-300 overflow-x-auto">
            <code>{`import MagazineReader from './components/MagazineReader';

function App() {
  const pages = [
    '/images/cover.jpg',
    '/images/page1.jpg',
    '/images/page2.jpg',
    // ... more pages
  ];

  return (
    <MagazineReader
      pages={pages}
      title="My Magazine"
      initialPage={0}
      onClose={() => console.log('Reader closed')}
    />
  );
}`}</code>
          </pre>
        </div>
      </div>

      {/* Magazine Reader */}
      {isReaderOpen && (
        <MagazineReader
          pages={magazinePages}
          title="Folio Magazine Demo"
          initialPage={0}
          onClose={() => setIsReaderOpen(false)}
        />
      )}
    </div>
  );
};

export default MagazineReaderDemo;
