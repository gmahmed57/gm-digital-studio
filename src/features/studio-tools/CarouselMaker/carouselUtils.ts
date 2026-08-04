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
  bodyLines: string[];
  imgKeyword: string;
  seed: number;
  showPhoto: boolean;
  customImage?: string | null;
  handle?: string;
  subtext?: string;
  avatar?: string | null;
}

export function parseSlides(raw: string): SlideData[] {
  raw = raw.trim();
  if(!raw) return [];
  let blocks;
  if(/\n\s*---\s*\n|^---\s*\n/.test(raw)){
    blocks = raw.split(/\n\s*---\s*\n/);
  } else {
    blocks = raw.split(/\n\s*\n/);
  }
  blocks = blocks.map(b=>b.trim()).filter(Boolean);

  return blocks.map((block, i) => {
    const lines = block.split('\n').map(l=>l.trim()).filter(Boolean);
    let imgKeyword = null;
    let headline = null;
    let layout: 'text'|'image' = 'text';
    const bodyLines = [];
    for(const line of lines){
      const imgMatch = line.match(/^img:\s*(.+)$/i);
      if(imgMatch){ imgKeyword = imgMatch[1].trim().split(/\s+/).slice(0,3).join(','); continue; }
      const typeMatch = line.match(/^type:\s*(.+)$/i);
      if(typeMatch){ if(/image|photo/i.test(typeMatch[1])) layout = 'image'; continue; }
      if(!headline){ headline = line; continue; }
      bodyLines.push(line);
    }
    if(!imgKeyword){
      const words = (headline||'').toLowerCase().replace(/[^a-z0-9\s]/g,'').split(/\s+/)
        .filter(w=>w && !STOPWORDS.has(w));
      imgKeyword = words.slice(0,2).join(',') || 'abstract,texture';
    }
    return {
      index: i,
      layout,
      headline: headline || `Slide ${i+1}`,
      bodyLines,
      imgKeyword,
      seed: Math.floor(Math.random()*10000),
      showPhoto: true,
    };
  });
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
  const pexelsKey = import.meta.env.VITE_PEXELS_API_KEY;
  const unsplashKey = import.meta.env.VITE_UNSPLASH_API_KEY;
  const page = (slide.seed % 12) + 1;
  
  if (pexelsKey) {
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(slide.imgKeyword)}&per_page=1&page=${page}&orientation=portrait`, {
        headers: { Authorization: pexelsKey }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.photos && data.photos.length > 0) {
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
      }
    } catch(e) {
      console.warn('Pexels fetch failed', e);
    }
  }

  if (unsplashKey) {
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(slide.imgKeyword)}&per_page=1&page=${page}&orientation=portrait`, {
        headers: { Authorization: `Client-ID ${unsplashKey}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const p = data.results[0];
          return {
            url: p.urls.regular,
            credit: {
              name: p.user.name,
              link: p.user.links.html,
              provider: 'Unsplash'
            }
          };
        }
      }
    } catch(e) {
      console.warn('Unsplash fetch failed', e);
    }
  }

  // Fallback to picsum
  return {
    url: `https://picsum.photos/seed/${encodeURIComponent(slide.imgKeyword + '-' + slide.seed)}/${w}/${h}`,
    credit: null
  };
}
