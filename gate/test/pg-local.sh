#!/usr/bin/env bash
# Disposable local Postgres for gate tests only (never the project backend).
# Usage: gate/test/pg-local.sh start|stop — listens on 127.0.0.1:54329, data under /tmp.
# Postgres refuses to run as root, so it runs as an existing unprivileged account.
set -euo pipefail
DIR=/tmp/pnw2-gate-pg
PORT=54329
RUN_AS=${PNW2_PG_RUN_AS:-lovable}
as_user() { if [ "$(id -u)" = "0" ]; then runuser -u "$RUN_AS" -- "$@"; else "$@"; fi; }
case "${1:-start}" in
  start)
    if [ ! -f "$DIR/PG_VERSION" ]; then
      mkdir -p "$DIR"
      [ "$(id -u)" = "0" ] && chown "$RUN_AS" "$DIR"
      as_user initdb -D "$DIR" -U pgtest --auth=trust -E UTF8 >/dev/null
    fi
    if ! as_user pg_ctl -D "$DIR" status >/dev/null 2>&1; then
      as_user pg_ctl -D "$DIR" -l "$DIR/log" -o "-p $PORT -k $DIR -c listen_addresses=127.0.0.1" -w start >/dev/null
    fi
    echo "postgres://pgtest@127.0.0.1:$PORT/postgres"
    ;;
  stop)
    as_user pg_ctl -D "$DIR" -m fast stop >/dev/null 2>&1 || true
    ;;
esac
