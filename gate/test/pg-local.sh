#!/usr/bin/env bash
# Disposable local Postgres for gate tests only (never the project backend).
# Usage: gate/test/pg-local.sh start|stop   — listens on 127.0.0.1:54329, data in /tmp.
set -euo pipefail
DIR=/tmp/pnw2-gate-pg
PORT=54329
USER_NAME=pgtest
case "${1:-start}" in
  start)
    id "$USER_NAME" >/dev/null 2>&1 || useradd -M -s /usr/sbin/nologin "$USER_NAME"
    if [ ! -f "$DIR/PG_VERSION" ]; then
      mkdir -p "$DIR" && chown "$USER_NAME" "$DIR"
      su -s /bin/sh "$USER_NAME" -c "initdb -D $DIR -U $USER_NAME --auth=trust -E UTF8 >/dev/null"
    fi
    if ! su -s /bin/sh "$USER_NAME" -c "pg_ctl -D $DIR status" >/dev/null 2>&1; then
      su -s /bin/sh "$USER_NAME" -c "pg_ctl -D $DIR -l $DIR/log -o '-p $PORT -k $DIR -c listen_addresses=127.0.0.1' -w start >/dev/null"
    fi
    echo "postgres://$USER_NAME@127.0.0.1:$PORT/postgres"
    ;;
  stop)
    su -s /bin/sh "$USER_NAME" -c "pg_ctl -D $DIR -m fast stop" >/dev/null 2>&1 || true
    ;;
esac
