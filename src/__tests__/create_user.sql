CREATE TABLE "user" (
  "id" SERIAL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  PRIMARY KEY ("id")
);

INSERT INTO "user"
  VALUES (DEFAULT, 'lupinek7@gmail.com', 'michal');

INSERT INTO "user"
  VALUES (DEFAULT, 'lupinek8@gmail.com', 'ania');

