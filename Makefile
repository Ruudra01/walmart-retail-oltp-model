# Stub targets. Each echoes what it will do; the phase that owns a target
# replaces its echo with the real command. Do not add a target here before the
# phase that needs it.

COMPOSE := docker compose -f docker/compose.yml

.PHONY: help db-up db-down migrate test-constraints test-data docs generate load

help:
	@echo "db-up            start local Postgres 16"
	@echo "db-down          stop it, keep the volume"
	@echo "migrate          apply forward-only migrations in migrations/"
	@echo "test-constraints run pgTAP schema tests against an EMPTY database"
	@echo "test-data        run data quality tests against LOADED data"
	@echo "docs             regenerate schema docs from the live database"
	@echo "generate         write synthetic data to data/ (gitignored)"
	@echo "load             load data/ into the database"

db-up:
	@echo "TODO: $(COMPOSE) up -d"

db-down:
	@echo "TODO: $(COMPOSE) down"

migrate:
	@echo "TODO: apply migrations/V*.sql in numeric order, forward-only"

test-constraints:
	@echo "TODO: run tests/constraints/ via pg_prove against an empty schema"

test-data:
	@echo "TODO: run tests/data_quality/ against loaded data"

docs:
	@echo "TODO: generate schema docs into schemaspy/output/ (gitignored)"

generate:
	@echo "TODO: run generator/ to write synthetic data into data/"

load:
	@echo "TODO: load data/ into the database"
