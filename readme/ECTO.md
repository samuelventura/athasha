
```bash
% mix ecto.gen.migration create_licenses
% mix ecto.migrate

samuel@svm-mbair backend % sqlite3 athasha_dev.db 
SQLite version 3.37.0 2021-12-09 01:34:53
Enter ".help" for usage hints.
sqlite> .schema
CREATE TABLE IF NOT EXISTS "schema_migrations" ("version" INTEGER PRIMARY KEY, "inserted_at" TEXT_DATETIME);
CREATE TABLE IF NOT EXISTS "items" ("id" INTEGER PRIMARY KEY, "name" TEXT, "type" TEXT, "enabled" BOOLEAN DEFAULT false NOT NULL, "config" JSON, "inserted_at" TEXT_DATETIME NOT NULL, "updated_at" TEXT_DATETIME NOT NULL);
CREATE TABLE IF NOT EXISTS "licenses" ("id" INTEGER PRIMARY KEY, "key" TEXT, "quantity" INTEGER, "signature" TEXT, "inserted_at" TEXT_DATETIME NOT NULL, "updated_at" TEXT_DATETIME NOT NULL);
```
