export type Report = {
  rank: number;
  name: string;
  country: string;
  wikipediaUrl: string;
};

export type Person = {
  id: number | undefined;
  rank: number;
  name: string;
  country: string;
  wikipediaUrl: string;
  content: string;
  ratingDisplay: string;
  rating: number;
  updated: number;
  created: number;
};
