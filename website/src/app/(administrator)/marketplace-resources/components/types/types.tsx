// types.ts
export interface Recommendation {
    id: string;
    crop: string;
    price: number;
    estimatedTime: number;
    location: string;
    color: string;
    coordinates: [number, number];
    name: string;
    description: string;
    storeCoordinates: [number, number];
    storeName: string;
    imageUrl: string
  }