CREATE TABLE "user" (
  "id" SERIAL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "boolColumn" bool NOT NULL,
  "charColumn" bpchar NULL,
  "dateColumn" date NOT NULL,
  "float4Column" float4 NULL,
  "float8Column" float8 NOT NULL,
  "int2Column" int2 NULL,
  "int4Column" int4 NOT NULL,
  "int8Column" int8 NULL,
  "numericColumn" numeric NOT NULL,
  "textColumn" text NULL,
  "timestampColumn" timestamp NOT NULL,
  "timestamptzColumn" timestamptz NULL,
  "varcharColumn" varchar NOT NULL,
  PRIMARY KEY ("id")
);

