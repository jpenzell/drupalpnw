#!/usr/bin/env bash
# Runs every gate test: pure verifier/handshake/client tests plus the local-Postgres suites.
# Uses a throwaway local database only; never the project backend, MainSite, providers or email.
set -euo pipefail
cd "$(dirname "$0")/../.."
gate/test/pg-local.sh start >/dev/null
trap 'gate/test/pg-local.sh stop' EXIT
PNW2_GATE_PG=local bun test ./gate ./src/lib/gate "$@"
