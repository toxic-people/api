```
npm install
npm run dev
```

```
npm run deploy
```

DB
==
npx wrangler d1 execute toxicpeople  --remote --file=./drizzle/migrations/migrate.sql

npx wrangler d1 execute toxicpeople  --remote --command="drop table person;"

npx wrangler d1 execute toxicpeople  --remote --command="CREATE TABLE person (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,country TEXT NOT NULL,wikipediaUrl TEXT NOT NULL UNIQUE, content TEXT NOT NULL,ratingDisplay TEXT NOT NULL,rating INTEGER NOT NULL,updated INTEGER NOT NULL,created INTEGER NOT NULL);"


