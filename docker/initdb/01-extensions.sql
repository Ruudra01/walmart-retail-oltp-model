-- Extensions the test harness needs, created before any migration runs.
--
-- This is NOT a migration and NOT a place for schema. Nothing here is
-- forward-only or versioned; it only makes the database capable of running
-- the tests. Tables, types, and constraints belong in migrations/.

CREATE EXTENSION IF NOT EXISTS pgtap;
