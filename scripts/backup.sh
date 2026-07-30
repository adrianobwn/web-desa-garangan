#!/usr/bin/env bash
# Backup PostgreSQL Desa Garangan.
#
# Pasang di crontab (tiap hari 02.00, simpan 30 hari terakhir):
#   0 2 * * * /path/ke/web-desa-garangan/scripts/backup.sh >> /var/log/backup-desa.log 2>&1
#
# Uji pemulihan minimal sekali (lihat README) — backup yang belum pernah
# dipulihkan bukan backup.
set -euo pipefail

TUJUAN="${BACKUP_DIR:-/var/backups/desa-garangan}"
SIMPAN_HARI="${BACKUP_KEEP_DAYS:-30}"
STAMP="$(date +%Y%m%d-%H%M%S)"

# Ambil DATABASE_URL dari .env bila belum ada di environment (cron polos).
if [ -z "${DATABASE_URL:-}" ]; then
  ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"
  [ -f "$ENV_FILE" ] || { echo "DATABASE_URL tidak ada dan $ENV_FILE tidak ditemukan"; exit 1; }
  DATABASE_URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"')"
fi

# Prisma memakai ?schema=public; pg_dump menolak parameter itu — buang.
DB_URL_BERSIH="${DATABASE_URL%%\?*}"

mkdir -p "$TUJUAN"
BERKAS="$TUJUAN/desa-garangan-$STAMP.sql.gz"

# -Fc lebih fleksibel untuk pemulihan sebagian, tapi .sql.gz mudah dibaca
# perangkat desa. Pakai --clean agar restore menimpa objek lama.
pg_dump --clean --if-exists --no-owner --dbname="$DB_URL_BERSIH" | gzip -9 > "$BERKAS"

# Gagal sunyi adalah musuh backup: pastikan berkas tidak kosong.
if [ ! -s "$BERKAS" ]; then
  echo "GAGAL: hasil dump kosong — $BERKAS"
  rm -f "$BERKAS"
  exit 1
fi

gzip -t "$BERKAS" || { echo "GAGAL: arsip rusak — $BERKAS"; exit 1; }

find "$TUJUAN" -name 'desa-garangan-*.sql.gz' -mtime "+$SIMPAN_HARI" -delete

echo "OK $(date -Iseconds) $BERKAS ($(du -h "$BERKAS" | cut -f1))"
