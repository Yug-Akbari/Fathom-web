export type APlusBlockType = 'standalone' | 'named_slide_group' | 'carousel_group';

export type APlusBlock = 
  | { 
      id: string; 
      type: 'standalone'; 
      desktopImage: string; 
      mobileImage: string; 
    }
  | { 
      id: string; 
      type: 'named_slide_group'; 
      slides: { title: string; desktopImage: string; mobileImage: string; }[]; 
    }
  | { 
      id: string; 
      type: 'carousel_group'; 
      slides: { desktopImage: string; mobileImage: string; }[]; 
    };

export interface Product {
    id: string;
    name: string;
    subtitle: string;
    price: number;
    image: string;
    images?: string[];
    badge?: string;
    category: string;
    finish: string;
    inStock: boolean;
    desc: string;
    specs?: { key: string; value: string }[];
    isFeatured?: boolean;
    isBestSeller?: boolean;
    isMainPanel?: boolean;
    aPlusContent?: APlusBlock[] | any; // 'any' kept for backward compatibility with old data
}
