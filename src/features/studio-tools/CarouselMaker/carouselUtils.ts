import { supabase } from '../../../services/supabase';

export const GRADIENTS = [
  { name:'Ember',    from:'#ff6b4a', to:'#2b0a1f', angle:145 },
  { name:'Deep Sea',  from:'#12b5b0', to:'#041c2c', angle:145 },
  { name:'Dusk',     from:'#8a63ff', to:'#170826', angle:145 },
  { name:'Gold Rush', from:'#f2b705', to:'#3a1401', angle:145 },
  { name:'Moss',     from:'#6fcf97', to:'#0c2116', angle:145 },
];

export const STOPWORDS = new Set(['the','a','an','of','to','in','and','for','on','with','your','you','is','how','why','best','top','my','that','this','it','are','from','at','be','as','or']);

export const FONT_PAIRS = [
  { name:'Editorial (default)', headline:"'Fraunces', serif",         body:"'Space Grotesk', sans-serif" },
  { name:'Classic Serif',       headline:"'Playfair Display', serif", body:"'Inter', sans-serif" },
  { name:'Modern Geometric',    headline:"'Poppins', sans-serif",     body:"'Poppins', sans-serif" },
  { name:'Bold Impact',         headline:"'Bebas Neue', sans-serif",  body:"'Work Sans', sans-serif" },
  { name:'Clean Corporate',     headline:"'Manrope', sans-serif",     body:"'Manrope', sans-serif" },
  { name:'Playful Rounded',     headline:"'Fredoka', sans-serif",     body:"'Nunito', sans-serif" },
  { name:'Ultra Bold (Anton)',  headline:"'Anton', sans-serif",       body:"'Inter', sans-serif" },
  { name:'Trendy Geometric',    headline:"'Outfit', sans-serif",      body:"'Outfit', sans-serif" },
  { name:'Instagram Classic',   headline:"'Montserrat', sans-serif",  body:"'Montserrat', sans-serif" },
];

export interface SlideData {
  index?: number;
  layout: 'text' | 'image' | 'cta' | 'fullimage';
  headline: string;
  subtext?: string;
  bodyLines?: string[];
  imgKeyword: string;
  seed: number;
  customImage?: string;
  showPhoto?: boolean;
  avatar?: string;
  handle?: string;
}

export function parseSlides(rawText: string): SlideData[] {
  if (!rawText) return [];
  const blocks = rawText.split('---').map(b => b.trim()).filter(Boolean);
  return blocks.map((block, index) => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const headline = lines[0] || '';
    let imgKeyword = 'design';
    const bodyLines: string[] = [];
    let subtext = '';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().startsWith('img:')) {
        imgKeyword = line.replace(/img:/i, '').trim();
      } else if (line.startsWith('-')) {
        bodyLines.push(line.replace(/^-/, '').trim());
      } else {
        if (!subtext) subtext = line;
        else bodyLines.push(line);
      }
    }

    return {
      index,
      layout: index === 0 ? 'text' : (bodyLines.length > 0 ? 'text' : 'image'),
      headline,
      subtext,
      bodyLines,
      imgKeyword,
      seed: 100 + index,
      showPhoto: true,
    };
  });
}

export function generateSlides(topic: string, goal: string, count: number): SlideData[] {
  const words = topic.split(' ').filter(w => !STOPWORDS.has(w.toLowerCase()));
  const keyword = words[0] || 'design';
  const keyword2 = words[1] || words[0] || 'creative';

  const slides: SlideData[] = [];

  // Cover
  slides.push({
    index: 0,
    layout: 'text',
    headline: topic,
    subtext: `Swipe to learn ${goal.toLowerCase() || 'more'} →`,
    imgKeyword: keyword,
    seed: 101,
  });

  // Middle slides
  const middleCount = count - 2;
  const templates = [
    { headline: `01. Clarify Your Objective`, subtext: `Focus on one core outcome for maximum impact and retention.` },
    { headline: `02. Keep It Visual`, subtext: `High contrast elements and clear hierarchy grab attention instantly.` },
    { headline: `03. Use High-Impact Typography`, subtext: `Pair expressive display headers with highly legible body copy.` },
    { headline: `04. Deliver Actionable Value`, subtext: `Every slide must solve a real problem or teach a concrete skill.` },
    { headline: `05. Maintain Visual Consistency`, subtext: `Stick to 2 complementary colors and a single font family throughout.` },
    { headline: `06. Structure for Skimmability`, subtext: `Use bold keywords and short sentences so readers grasp value instantly.` },
  ];

  for (let i = 0; i < middleCount; i++) {
    const t = templates[i % templates.length];
    const isImageSlide = i % 2 === 1;
    slides.push({
      index: i + 1,
      layout: isImageSlide ? 'image' : 'text',
      headline: t.headline,
      subtext: t.subtext,
      imgKeyword: i % 2 === 0 ? keyword : keyword2,
      seed: 201 + i,
    });
  }

  // CTA
  slides.push({
    index: count - 1,
    layout: 'cta',
    headline: `Save & Share This Post`,
    subtext: `Found this helpful? Tap save so you can refer back to it anytime.`,
    imgKeyword: keyword,
    seed: 301,
  });

  return slides;
}

export function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#','');
  const r = parseInt(h.substring(0,2),16), g = parseInt(h.substring(2,4),16), b = parseInt(h.substring(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function getGradientForSlide(i: number, customColor: { from: string, to: string } | null) {
  if (customColor) {
    return { name:'Custom', from: customColor.from, to: customColor.to, angle:145 };
  }
  return GRADIENTS[i % GRADIENTS.length];
}

export async function fetchPhotoForSlide(slide: SlideData, w: number, h: number): Promise<{url: string, credit: any}> {
  const page = (slide.seed % 12) + 1;
  
  if (supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('pexels-proxy', {
        body: {
          query: slide.imgKeyword,
          page: page,
          per_page: 1,
          orientation: 'portrait'
        }
      });
      if (!error && data && data.photos && data.photos.length > 0) {
        const p = data.photos[0];
        return {
          url: p.src.large2x || p.src.large,
          credit: {
            name: p.photographer,
            link: p.photographer_url,
            provider: 'Pexels'
          }
        };
      }
    } catch(e) {
      console.warn('Pexels proxy fetch failed', e);
    }
  }

  // Fallback to picsum
  return {
    url: `https://picsum.photos/seed/${encodeURIComponent(slide.imgKeyword + '-' + slide.seed)}/${w}/${h}`,
    credit: null
  };
}
