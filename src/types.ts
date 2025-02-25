export type Report = {
  rank: number;
  name: string;
  country: string;
  wikipediaUrl: string;
};

export type Person = {
  name: string;
  country: string;
  wikipediaUrl: string;
  content: string;
  ratingDisplay: string;
  rating: number;
  updated: number;
  created: number;
};

export type People = {
  rank: number;
  name: string;
  country: string;
  wikipediaUrl: string;
};

export type Render = {
  people: People[];
  created: number;
};
