#!/bin/bash
unset DATABASE_URL
export DATABASE_URL='postgresql://postgres:2ce556078d9466fd424499d31b67e3b6@3kgi95g9.ap-southeast.database.insforge.app:5432/insforge?sslmode=require'
export NODE_OPTIONS='--max-old-space-size=512'
cd "$(dirname "$0")"
exec npx next dev -H 0.0.0.0 -p 3000 "$@"
