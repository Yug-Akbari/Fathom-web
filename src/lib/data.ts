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
}


