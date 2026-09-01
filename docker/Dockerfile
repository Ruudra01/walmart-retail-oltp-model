# Postgres 16 plus pgTAP, so constraint tests can run against the same server
# the migrations were applied to. Referenced by docker/compose.yml and by CI.
#
# postgres:16 already carries the PGDG apt repo, so the extension comes from
# the same source as the server itself — no version skew.

FROM postgres:16

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      postgresql-16-pgtap \
      libtap-parser-sourcehandler-pgtap-perl \
 && rm -rf /var/lib/apt/lists/*

# Runs only on a fresh volume (empty PGDATA). Re-running against an existing
# volume is a no-op — `make db-down && docker volume rm` to force it.
COPY initdb/ /docker-entrypoint-initdb.d/
