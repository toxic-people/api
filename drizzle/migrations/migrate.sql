
DROP TABLE content;
CREATE TABLE content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  contentOrg TEXT NOT NULL,
  creator TEXT NOT NULL,
  updated INTEGER NOT NULL,
  created INTEGER NOT NULL
);


DROP TABLE person;
CREATE TABLE person (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  wikipediaUrl TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  ratingDisplay TEXT NOT NULL,
  rating INTEGER NOT NULL,
  updated INTEGER NOT NULL,
  created INTEGER NOT NULL
);
