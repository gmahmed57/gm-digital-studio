import React, { useState, useEffect, useRef, useMemo } from 'react';

import { parseSlides, FONT_PAIRS } from './carouselUtils';
import { SlideRenderer } from './SlideRenderer';
import { captureNodeToCanvas, exportPDF, exportImageZip } from './carouselExportUtils';
import { useAuth } from '../../../context/AuthContext';
import { activityLogService } from '../../../services/activityLogService';
import './CarouselMaker.css';

import { Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { createRoot } from 'react-dom/client';

const EXAMPLE_TEXT = `5 Morning Habits That Changed My Life
img: sunrise coffee window
Small shifts, big results. Swipe through 5 habits worth stealing.

---
1. Wake Up Without Your Phone
img: alarm clock morning light
- Keep your phone outside the bedroom
- Use a real alarm clock instead
- Give your brain 20 minutes before any screen

---
2. Drink Water Before Coffee
img: glass water morning
- Rehydrate first, caffeinate second
- Add a pinch of salt for electrolytes
- Your body has been fasting for 8 hours

---
3. Protect Your First Hour
img: quiet morning workspace
- No email, no Slack, no scrolling
- This hour sets the tone for everything else
- Guard it like it matters, because it does`;

export const CarouselMakerWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [sourceText, setSourceText] = useState(EXAMPLE_TEXT);
  const [slideStyle, setSlideStyle] = useState<'photo'|'flat'>('photo');
  const [fontPairIndex, setFontPairIndex] = useState(0);
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [colorFrom, setColorFrom] = useState('#ff6b4a');
  const [colorTo, setColorTo] = useState('#2b0a1f');
  
  const [heroImageDataURL, setHeroImageDataURL] = useState<string | null>(null);
  const [heroFullSlide, setHeroFullSlide] = useState(true);
  const [logoDataURL, setLogoDataURL] = useState<string | null>(null);

  const [ctaEnabled, setCtaEnabled] = useState(false);
  const [ctaHeadline, setCtaHeadline] = useState('');
  const [ctaHandle, setCtaHandle] = useState('');
  const [ctaSubtext, setCtaSubtext] = useState('');
  const [ctaAvatarDataURL, setCtaAvatarDataURL] = useState<string | null>(null);

  const [seedOverrides, setSeedOverrides] = useState<Record<number, number>>({});

  const [exportFormat, setExportFormat] = useState<'pdf'|'jpg'|'png'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const parsedTextSlides = useMemo(() => parseSlides(sourceText), [sourceText]);

  const slidesData = useMemo(() => {
    let arr = parsedTextSlides.map(slide => ({ ...slide, seed: (slide.index !== undefined && seedOverrides[slide.index] !== undefined) ? seedOverrides[slide.index] : slide.seed }));
    if (heroFullSlide && heroImageDataURL) {
      arr = [{ layout: 'fullimage', customImage: heroImageDataURL, headline: '', bodyLines: [], imgKeyword: '', seed: 0, showPhoto: true } as any, ...arr];
    }
    if (ctaEnabled) {
      arr.push({
        layout: 'cta',
        headline: ctaHeadline.trim() || 'Follow for more',
        handle: ctaHandle.trim(),
        subtext: ctaSubtext.trim(),
        avatar: ctaAvatarDataURL,
        bodyLines: [], imgKeyword: '', seed: 0, showPhoto: false
      });
    }
    return arr;
  }, [parsedTextSlides, heroFullSlide, heroImageDataURL, ctaEnabled, ctaHeadline, ctaHandle, ctaSubtext, ctaAvatarDataURL, seedOverrides]);

  const customColor = useCustomColor ? { from: colorFrom, to: colorTo } : null;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let scrollTimeout: any;
    const onScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const wrappers = Array.from(track.querySelectorAll('.slide-wrapper'));
        if (!wrappers.length) return;
        const trackCenter = track.scrollLeft + track.clientWidth / 2;
        let closest = 0, closestDist = Infinity;
        wrappers.forEach((w: any, i) => {
          const c = w.offsetLeft + w.clientWidth / 2;
          const dist = Math.abs(c - trackCenter);
          if (dist < closestDist) { closestDist = dist; closest = i; }
        });
        setCurrentIndex(closest);
      }, 80);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [slidesData]);

  const scrollToIndex = (idx: number) => {
    if (!trackRef.current) return;
    const wrappers = trackRef.current.querySelectorAll('.slide-wrapper');
    if (wrappers[idx]) {
      wrappers[idx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      setCurrentIndex(idx);
    }
  };

  const handleReroll = (originalIndex: number) => {
    setSeedOverrides(prev => ({ ...prev, [originalIndex]: Math.floor(Math.random() * 10000) }));
  };

  const handleExport = async () => {
    if (!slidesData.length) return;
    setIsExporting(true);
    setExportProgress('Initializing export...');

    try {
      const offscreenContainer = document.createElement('div');
      offscreenContainer.className = 'carousel-maker-app carousel-maker-wrapper';
      offscreenContainer.style.position = 'fixed';
      offscreenContainer.style.top = '-9999px';
      offscreenContainer.style.left = '-9999px';
      document.body.appendChild(offscreenContainer);

      const canvases = [];
      for (let i = 0; i < slidesData.length; i++) {
        setExportProgress(`Rendering slide ${i + 1} of ${slidesData.length}...`);
        
        const slideWrapper = document.createElement('div');
        offscreenContainer.appendChild(slideWrapper);
        
        const root = createRoot(slideWrapper);
        let nodeRef: HTMLDivElement | null = null;
        
        await new Promise<void>(resolve => {
          root.render(
            <SlideRenderer 
              ref={(el) => { nodeRef = el; }}
              slide={slidesData[i]} 
              index={i} 
              total={slidesData.length}
              slideStyle={slideStyle}
              fontPairIndex={fontPairIndex}
              customColor={customColor}
              logoDataURL={logoDataURL}
              showCredit={false}
              heroImageDataURL={heroImageDataURL}
              heroFullSlide={heroFullSlide}
              isOffscreenExport={true}
            />
          );
          // Wait for render to commit
          setTimeout(resolve, 500);
        });

        if (nodeRef) {
          const canvas = await captureNodeToCanvas(nodeRef);
          canvases.push(canvas);
        }
        
        root.unmount();
        offscreenContainer.removeChild(slideWrapper);
      }

      document.body.removeChild(offscreenContainer);

      if (exportFormat === 'pdf') {
        await exportPDF(canvases, setExportProgress);
      } else {
        await exportImageZip(canvases, exportFormat, setExportProgress);
      }

      activityLogService.logActivity({
        user_name: user?.fullName || 'Client User',
        user_email: user?.email || 'client@company.com',
        user_role: 'client',
        action: 'TOOL_EXECUTED',
        entity_type: 'tools',
        entity_id: 'carousel-maker',
        details: `Client ${user?.fullName || 'User'} (${user?.email}) generated and downloaded a ${slidesData.length}-slide Carousel Post deck (${exportFormat.toUpperCase()}).`
      });
    } catch (error) {
      console.error(error);
      setExportProgress('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(''), 3000);
    }
  };

  return (
    <div className="carousel-maker-wrapper">
      <div className="carousel-maker-app border border-gray-200 dark:border-dark-border rounded-2xl overflow-hidden shadow-xs h-[calc(100vh-180px)]">
        {/* CONTROL PANEL */}
        <div className="control-panel overflow-y-auto dark:bg-dark-surface dark:text-gray-200">
          <div className="wordmark">
            <span className="eyebrow-tiny">GM Digital Studio</span>
            <h1>AI Carousel Maker</h1>
            <p className="dark:text-gray-400">Paste your content, get a modern gradient-and-photo deck instantly.</p>
          </div>

          <div className="space-y-6 mt-4">
            <div>
              <label className="field-label">Slide Style</label>
              <div className="flex gap-2 p-1 bg-gray-100 dark:bg-dark-bg rounded-lg">
                {(['photo', 'flat'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSlideStyle(s)}
                    className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-md transition-all ${slideStyle === s ? 'bg-white dark:bg-gray-800 text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div id="heroImageWrap">
              <label className="field-label">Cover image (slide 1)</label>
              <input type="file" id="heroImageInput" accept="image/*" className="hidden" onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setHeroImageDataURL(reader.result as string);
                reader.readAsDataURL(file);
              }} />
              <div className="flex gap-2">
                <button onClick={() => document.getElementById('heroImageInput')?.click()} className="flex-1 py-2 text-xs font-semibold rounded border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
                  Upload cover image
                </button>
                {heroImageDataURL && (
                  <button onClick={() => { setHeroImageDataURL(null); (document.getElementById('heroImageInput') as HTMLInputElement).value = ''; }} className="py-2 px-3 text-xs font-semibold rounded border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                    Remove
                  </button>
                )}
              </div>
              <label className="flex items-center gap-2 mt-2 text-[11px] text-gray-500 cursor-pointer">
                <input type="checkbox" checked={heroFullSlide} onChange={e => setHeroFullSlide(e.target.checked)} className="accent-brand-500 w-3 h-3 rounded" />
                Use as a full slide, inserted as slide 1 (no text on it)
              </label>
            </div>

            <div>
              <label className="field-label">Font pairing</label>
              <select value={fontPairIndex} onChange={e => setFontPairIndex(Number(e.target.value))} className="w-full p-2.5 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg dark:text-white">
                {FONT_PAIRS.map((p, i) => (
                  <option key={i} value={i}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label flex items-center justify-between">
                <span>Carousel Copy</span>
                <button onClick={() => setSourceText(EXAMPLE_TEXT)} className="text-[10px] text-brand-500 hover:underline flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Load Example
                </button>
              </label>
              <textarea
                value={sourceText}
                onChange={e => setSourceText(e.target.value)}
                className="w-full h-48 p-3 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none transition-all"
                spellCheck="false"
              />
            </div>

            <div>
              <label className="field-label">Gradient rotation</label>
              <div className="flex items-center gap-3 mt-1">
                <input type="color" value={colorFrom} onChange={e => setColorFrom(e.target.value)} title="Gradient start" />
                <input type="color" value={colorTo} onChange={e => setColorTo(e.target.value)} title="Gradient end" />
                <label className="flex items-center gap-2 text-[11px] text-gray-500 cursor-pointer">
                  <input type="checkbox" checked={useCustomColor} onChange={e => setUseCustomColor(e.target.checked)} className="accent-brand-500 w-3 h-3 rounded" />
                  Use custom colors
                </label>
              </div>
            </div>

            <div>
              <label className="field-label">Logo</label>
              <input type="file" id="logoInput" accept="image/*" className="hidden" onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setLogoDataURL(reader.result as string);
                reader.readAsDataURL(file);
              }} />
              <div className="flex gap-2">
                <button onClick={() => document.getElementById('logoInput')?.click()} className="flex-1 py-2 text-xs font-semibold rounded border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
                  Upload logo
                </button>
                {logoDataURL && (
                  <button onClick={() => { setLogoDataURL(null); (document.getElementById('logoInput') as HTMLInputElement).value = ''; }} className="py-2 px-3 text-xs font-semibold rounded border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="field-label mb-2 flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={ctaEnabled} onChange={e => setCtaEnabled(e.target.checked)} className="accent-brand-500 w-3 h-3 rounded" />
                Add a closing CTA slide
              </label>
              {ctaEnabled && (
                <div className="flex flex-col gap-2 mt-2">
                  <input type="text" value={ctaHeadline} onChange={e => setCtaHeadline(e.target.value)} placeholder="Headline (e.g. Follow for more)" className="w-full p-2.5 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg dark:text-white" />
                  <input type="text" value={ctaHandle} onChange={e => setCtaHandle(e.target.value)} placeholder="@yourhandle or yoursite.com" className="w-full p-2.5 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg dark:text-white" />
                  <input type="text" value={ctaSubtext} onChange={e => setCtaSubtext(e.target.value)} placeholder="Optional tagline" className="w-full p-2.5 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg dark:text-white" />
                  <input type="file" id="ctaAvatarInput" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setCtaAvatarDataURL(reader.result as string);
                    reader.readAsDataURL(file);
                  }} />
                  <div className="flex gap-2">
                    <button onClick={() => document.getElementById('ctaAvatarInput')?.click()} className="flex-1 py-2 text-xs font-semibold rounded border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
                      Upload profile photo
                    </button>
                    {ctaAvatarDataURL && (
                      <button onClick={() => { setCtaAvatarDataURL(null); (document.getElementById('ctaAvatarInput') as HTMLInputElement).value = ''; }} className="py-2 px-3 text-xs font-semibold rounded border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="field-label">Export Format</label>
              <select 
                value={exportFormat} 
                onChange={e => setExportFormat(e.target.value as 'pdf'|'jpg'|'png')}
                className="w-full p-2.5 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg dark:text-white"
              >
                <option value="pdf">PDF (Multi-page)</option>
                <option value="jpg">JPG Images (.zip)</option>
                <option value="png">PNG Images (.zip)</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting || slidesData.length === 0}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? 'Processing Export...' : `Export ${exportFormat.toUpperCase()} Deck`}
            </button>
            {exportProgress && <p className="text-xs text-center text-brand-600 font-medium">{exportProgress}</p>}
          </div>
        </div>

        {/* STAGE */}
        <div className="stage flex flex-col bg-gray-100 dark:bg-dark-bg relative overflow-hidden">
          <div className="stage-header pt-4 px-6 flex justify-between items-center z-10">
            <div className="font-semibold text-gray-500 dark:text-gray-400 text-sm">
              <span className="text-gray-900 dark:text-white">{slidesData.length > 0 ? currentIndex + 1 : 0}</span> / {slidesData.length}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => scrollToIndex(Math.max(0, currentIndex - 1))}
                className="w-8 h-8 rounded-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex items-center justify-center hover:text-brand-500 hover:border-brand-500 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => scrollToIndex(Math.min(slidesData.length - 1, currentIndex + 1))}
                className="w-8 h-8 rounded-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex items-center justify-center hover:text-brand-500 hover:border-brand-500 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div 
            ref={trackRef}
            className="carousel-track flex-1 flex gap-8 overflow-x-auto pb-8 pt-4 px-[10vw] snap-x snap-mandatory hide-scrollbar items-center"
          >
            {slidesData.length === 0 ? (
              <div className="w-full text-center text-gray-400 text-sm p-12">
                Paste your carousel copy on the left to generate the deck.
              </div>
            ) : (
              slidesData.map((slide, i) => (
                <div key={i} className="slide-wrapper shrink-0 snap-center rounded-[20px] shadow-2xl relative w-[min(320px,78vw)] aspect-[1080/1350] bg-gray-900 overflow-hidden ring-1 ring-black/10">
                  <div className="absolute inset-0 origin-top-left" style={{ transform: 'scale(0.29629)', width: '1080px', height: '1350px' }}>
                    <SlideRenderer 
                      slide={slide} 
                      index={i} 
                      total={slidesData.length}
                      slideStyle={slideStyle}
                      fontPairIndex={fontPairIndex}
                      customColor={customColor}
                      logoDataURL={logoDataURL}
                      showCredit={false}
                      heroImageDataURL={heroImageDataURL}
                      heroFullSlide={heroFullSlide}
                      onReroll={slide.index !== undefined ? () => handleReroll(slide.index!) : undefined}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
