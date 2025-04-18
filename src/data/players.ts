export interface Player {
  _id: string;
  name: string;
  attack: number;
  defense: number;
  physical: number;
  vision: number;
  technique: number;
  average: number;
  isGuest: boolean;
  avatar?: {
    hair?: string;
    hairColor?: string;
    facialHair?: string;
    facialHairColor?: string;
    skinColor?: string;
    accessories?: string;
    accessoriesColor?: string;
  };
}