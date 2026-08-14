import React, { useEffect, useState } from 'react';
import type { SlideData } from './carouselUtils';
import { getGradientForSlide, FONT_PAIRS, fetchPhotoForSlide, hexToRgba } from './carouselUtils';

interface SlideRendererProps {
  slide: SlideData;
  index: number;
  total: number;
  slideStyle: 'photo' | 'flat';
  fontPairIndex: number;
  customColor: { from: string, to: string } | null;
  logoDataURL: string | null;
  showCredit: boolean;
  heroImageDataURL: string | null;
  heroFullSlide: boolean;
  isOffscreenExport?: boolean;
  onReroll?: () => void;
}

export const SlideRenderer = React.forwardRef<HTMLDivElement, SlideRendererProps>(({
  slide, index, total, slideStyle, fontPairIndex, customColor,
  logoDataURL, showCredit, heroImageDataURL, heroFullSlide, isOffscreenExport = false,
  onReroll
}, ref) => {
  const [photoData, setPhotoData] = useState<{url: string, credit: any} | null>(null);

  const isSlideOne = index === 0 && slide.layout !== 'cta';
  const useCustomCover = isSlideOne && !!heroImageDataURL && !heroFullSlide && slideStyle === 'photo';

  useEffect(() => {
    if (slide.layout === 'fullimage') {
      setPhotoData({ url: slide.customImage || '', credit: null });
      return;
    }
    const usePhoto = slide.showPhoto && (slideStyle === 'photo' || slide.layout === 'image');
    if (usePhoto) {
      if (useCustomCover && heroImageDataURL) {
        setPhotoData({ url: heroImageDataURL, credit: null });
      } else {
        const w = isOffscreenExport ? 1080 : 540;
        const h = isOffscreenExport ? 1350 : 675;
        fetchPhotoForSlide(slide, w, h).then(res => setPhotoData(res));
      }
    } else {
      setPhotoData(null);
    }
  }, [slide, slideStyle, useCustomCover, heroImageDataURL, isOffscreenExport]);

  const canReroll = !isOffscreenExport && onReroll && slide.showPhoto && !useCustomCover && 
    (slideStyle === 'photo' || slide.layout === 'image');

  if (slide.layout === 'fullimage') {
    return (
      <>
        <div ref={ref} className="slide is-full-image" style={{ width: isOffscreenExport ? 1080 : '100%', height: isOffscreenExport ? 1350 : '100%' }}>
        {photoData && <img className="bg-photo" src={photoData.url} alt="Cover" crossOrigin={isOffscreenExport ? "anonymous" : undefined} referrerPolicy={isOffscreenExport ? "no-referrer" : undefined} />}
        <div className="dots">
          {Array.from({ length: total }).map((_, d) => (
            <span key={d} className={d === index ? 'active' : ''} />
          ))}
        </div>
      </div>
        {canReroll && (
          <button type="button" className="reroll-btn" onClick={onReroll} title="Try a different photo">⟳</button>
        )}
      </>
    );
  }

  const g = getGradientForSlide(index, customColor);
  const fontPair = FONT_PAIRS[fontPairIndex] || FONT_PAIRS[0];

  const classNames = [
    'slide',
    index === 0 && slide.layout === 'text' ? 'is-cover' : '',
    slide.layout === 'cta' ? 'is-cta' : '',
    slideStyle === 'flat' ? 'is-flat' : '',
  ].filter(Boolean).join(' ');

  const styleObj = {
    '--font-headline': fontPair.headline,
    '--font-body': fontPair.body,
    width: isOffscreenExport ? 1080 : '100%',
    height: isOffscreenExport ? 1350 : '100%'
  } as React.CSSProperties;

  const bgStyle = {
    background: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`
  };

  const renderFlatDecor = () => {
    if (slideStyle !== 'flat') return null;
    const fillSpots = [
      { top:'-14%', right:'-18%', size:560 },
      { bottom:'-16%', left:'-20%', size:520 },
      { top:'-10%', left:'-16%', size:480 },
      { bottom:'-14%', right:'-14%', size:580 },
    ];
    const ringSpots = [
      { bottom:'12%', left:'-6%', size:180 },
      { top:'14%', right:'8%', size:150 },
      { bottom:'10%', right:'-4%', size:170 },
      { top:'10%', left:'10%', size:140 },
    ];
    const fillSpot = fillSpots[index % fillSpots.length];
    const ringSpot = ringSpots[index % ringSpots.length];

    return (
      <>
        <div className="flat-shape solid" style={{ ...fillSpot as any, width: fillSpot.size, height: fillSpot.size, '--blob-fill': hexToRgba(g.from, 0.18) } as any} />
        <div className="flat-shape ring" style={{ ...ringSpot as any, width: ringSpot.size, height: ringSpot.size, '--blob-fill': 'rgba(255,255,255,0.3)' } as any} />
      </>
    );
  };

  const renderTextContent = () => {
    const lines = slide.bodyLines || [];
    const bullets = lines.filter((l: string) => /^[-•]\s/.test(l));
    const paras = lines.filter((l: string) => !/^[-•]\s/.test(l));

    return (
      <div className="content">
        <div className="eyebrow">
          {index === 0 ? 'Swipe to explore' : `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`}
        </div>
        <h2>{slide.headline}</h2>
        <div className="body">
          {paras.map((p: string, i: number) => <p key={`p-${i}`}>{p}</p>)}
          {bullets.length > 0 && (
            <ul>
              {bullets.map((b: string, i: number) => <li key={`b-${i}`}>{b.replace(/^[-•]\s/, '')}</li>)}
            </ul>
          )}
        </div>
      </div>
    );
  };

  const renderCTAContent = () => (
    <div className="content">
      {slide.avatar && (
        <div className="cta-avatar">
          <img src={slide.avatar} alt="Avatar" />
        </div>
      )}
      <h2 className="cta-headline">{slide.headline}</h2>
      {slide.subtext && <p className="cta-subtext">{slide.subtext}</p>}
      {slide.handle && <div className="cta-pill">{slide.handle}</div>}
    </div>
  );

  return (
    <>
    <div ref={ref} className={classNames} style={styleObj}>
      <div className="bg-gradient" style={bgStyle} />
      
      {photoData && (
        <>
          <img 
            className="bg-photo" 
            src={photoData.url} 
            crossOrigin={isOffscreenExport ? "anonymous" : undefined}
            referrerPolicy={isOffscreenExport ? "no-referrer" : undefined}
            onError={(e) => {
              if (useCustomCover) return;
              e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(slide.imgKeyword + '-' + slide.seed)}/${isOffscreenExport ? 1080 : 540}/${isOffscreenExport ? 1350 : 675}`;
            }}
          />
          <div className="color-wash" style={{ background: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})` }} />
        </>
      )}

      {renderFlatDecor()}

      <div className="scrim" />
      <div className="grain" />

      {slide.layout !== 'image' && (
        <div className="ghost-number">{String(index + 1).padStart(2, '0')}</div>
      )}

      {slide.layout === 'cta' ? renderCTAContent() : slide.layout !== 'image' ? renderTextContent() : null}

      <div className="dots">
        {Array.from({ length: total }).map((_, d) => (
          <span key={d} className={d === index ? 'active' : ''} />
        ))}
      </div>

      {logoDataURL && (
        <img className="slide-logo" src={logoDataURL} crossOrigin={isOffscreenExport ? "anonymous" : undefined} />
      )}

      {showCredit && photoData?.credit?.name && (
        <div className="photo-credit">
          Photo: {photoData.credit.name} / {photoData.credit.provider}
        </div>
      )}
    </div>
    {canReroll && (
      <button type="button" className="reroll-btn" onClick={onReroll} title="Try a different photo">⟳</button>
    )}
    </>
  );
});
