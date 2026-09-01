# Stub targets. Each echoes what it will do; the phase that owns a target
# replaces its echo with the real command. Do not add a target here before the
# phase that needs it.

COMPOSE := docker compose -f docker/compose.yml

.PHONY: help db-up db-down migrate seed test-constraints test-data lint docs generate load ci-local

help:
	@echo "db-up            start local Postgres 16 with pgTAP"
	@echo "db-down          stop it, keep the volume"
	@echo "migrate          apply forward-only migrations in migrations/"
	@echo "seed             load committed reference data from seeds/"
	@echo "test-constraints run pgTAP schema tests against an EMPTY database"
	@echo "test-data        run data quality tests against LOADED data"
	@echo "lint             sqlfluff over migrations/ and tests/"
	@echo "docs             regenerate schema docs from the live database"
	@echo "generate         write synthetic data to data/ (gitignored)"
	@echo "load             load data/ into the database"
	@echo "ci-local         run what CI runs, against a clean database"

db-up:
	@echo "TODO: $(COMPOSE) up -d --build"

db-down:
	@echo "TODO: $(COMPOSE) down"

migrate:
	@echo "TODO: apply migrations/V*.sql in numeric order, forward-only"

seed:
	@echo "TODO: load seeds/*.csv in dependency order, idempotently"

test-constraints:
	@echo "TODO: run tests/constraints/ via pg_prove against an empty schema"

test-data:
	@echo "TODO: run tests/data_quality/ against loaded data"

lint:
	@echo "TODO: sqlfluff lint migrations/ tests/ seeds/"

docs:
	@echo "TODO: generate schema docs into schemaspy/output/ (gitignored)"

generate:
	@echo "TODO: run generator/ to write synthetic data into data/"

load:
	@echo "TODO: load data/ into the database"

# Same sequence as .github/workflows/ci.yml, so a red build is reproducible
# locally. Rebuilds from an empty database on purpose — that is the check.
ci-local: db-down db-up migrate seed test-constraints lint
	@echo "ci-local complete"
