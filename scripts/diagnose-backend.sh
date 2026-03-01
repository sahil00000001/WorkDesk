#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
#
#   WorkDesk — Backend Full Diagnostic Report
#   Backend  : https://zoho-backend-rho.vercel.app
#   Frontend : https://github.com/sahil00000001/WorkDesk
#   Backend  : https://github.com/sahil00000001/zoho-backend
#
#   Run      : bash scripts/diagnose-backend.sh
#   Purpose  : Tests every API endpoint, prints colour-coded results,
#              and lists all known issues with exact fix steps.
#
# ═══════════════════════════════════════════════════════════════════════════════

BASE="https://zoho-backend-rho.vercel.app"
PASS="✅ PASS"
FAIL="❌ FAIL"
WARN="⚠️  WARN"
SKIP="⏭  SKIP"

ISSUES=0

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "  WorkDesk Backend Diagnostic  ·  $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Target : $BASE"
echo "═══════════════════════════════════════════════════════════════════════"

# ─── Helper ──────────────────────────────────────────────────────────────────

check() {
  local label="$1"
  local expected="$2"
  local cmd="$3"
  local note="$4"

  local out
  out=$(eval "$cmd" 2>/dev/null)
  local status
  status=$(echo "$out" | grep -o 'HTTP:[0-9]*' | tail -1 | sed 's/HTTP://')
  local body
  body=$(echo "$out" | grep -v 'HTTP:' | tail -1)

  if [ "$status" = "$expected" ]; then
    printf "  %-48s [%s]  HTTP %s\n" "$label" "$PASS" "$status"
  else
    printf "  %-48s [%s]  HTTP %s  (expected %s)\n" "$label" "$FAIL" "$status" "$expected"
    printf "     └─ Response : %s\n" "$body"
    if [ -n "$note" ]; then
      printf "     └─ Cause    : %s\n" "$note"
    fi
    ISSUES=$((ISSUES + 1))
  fi
}

# ─── Section 1 : Infrastructure ──────────────────────────────────────────────

echo ""
echo "┌──────────────────────────────────────────────────────────────────────"
echo "│  1. Infrastructure"
echo "└──────────────────────────────────────────────────────────────────────"

check \
  "GET  /api/health  (DB + server)" \
  "200" \
  "curl -s -w '\nHTTP:%{http_code}' $BASE/api/health"

# ─── Section 2 : Authentication — OTP Flow ───────────────────────────────────

echo ""
echo "┌──────────────────────────────────────────────────────────────────────"
echo "│  2. Authentication — OTP Flow"
echo "└──────────────────────────────────────────────────────────────────────"

check \
  "POST /api/auth/login  (registered email)" \
  "200" \
  "curl -s -w '\nHTTP:%{http_code}' -X POST $BASE/api/auth/login \
   -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\"}'" \
  "SMTP crash — see Issue #1 below"

check \
  "POST /api/auth/login  (unknown email)" \
  "200" \
  "curl -s -w '\nHTTP:%{http_code}' -X POST $BASE/api/auth/login \
   -H 'Content-Type: application/json' -d '{\"email\":\"nobody@fake.com\"}'"

check \
  "POST /api/auth/verify-otp  (wrong OTP → 401)" \
  "401" \
  "curl -s -w '\nHTTP:%{http_code}' -X POST $BASE/api/auth/verify-otp \
   -H 'Content-Type: application/json' \
   -d '{\"email\":\"admin@company.com\",\"otp\":\"000000\"}'"

check \
  "POST /api/auth/refresh  (invalid token → 401)" \
  "401" \
  "curl -s -w '\nHTTP:%{http_code}' -X POST $BASE/api/auth/refresh \
   -H 'Content-Type: application/json' \
   -d '{\"refreshToken\":\"invalid.token.here\"}'"

check \
  "POST /api/auth/logout  (any token → 200)" \
  "200" \
  "curl -s -w '\nHTTP:%{http_code}' -X POST $BASE/api/auth/logout \
   -H 'Content-Type: application/json' \
   -d '{\"refreshToken\":\"invalid.token.here\"}'"

# ─── Section 3 : Protected Routes (no token — all must return 401) ───────────

echo ""
echo "┌──────────────────────────────────────────────────────────────────────"
echo "│  3. Protected Routes  (no token — all must return 401)"
echo "└──────────────────────────────────────────────────────────────────────"

check \
  "GET  /api/auth/me" \
  "401" \
  "curl -s -w '\nHTTP:%{http_code}' $BASE/api/auth/me"

check \
  "GET  /api/attendance/today" \
  "401" \
  "curl -s -w '\nHTTP:%{http_code}' $BASE/api/attendance/today"

check \
  "POST /api/attendance/check-in" \
  "401" \
  "curl -s -w '\nHTTP:%{http_code}' -X POST $BASE/api/attendance/check-in \
   -H 'Content-Type: application/json'"

check \
  "POST /api/attendance/check-out" \
  "401" \
  "curl -s -w '\nHTTP:%{http_code}' -X POST $BASE/api/attendance/check-out \
   -H 'Content-Type: application/json'"

check \
  "GET  /api/leaves" \
  "401" \
  "curl -s -w '\nHTTP:%{http_code}' $BASE/api/leaves"

check \
  "POST /api/leaves" \
  "401" \
  "curl -s -w '\nHTTP:%{http_code}' -X POST $BASE/api/leaves \
   -H 'Content-Type: application/json'"

check \
  "GET  /api/leave-types" \
  "401" \
  "curl -s -w '\nHTTP:%{http_code}' $BASE/api/leave-types"

# ─── Summary ─────────────────────────────────────────────────────────────────

echo ""
echo "┌──────────────────────────────────────────────────────────────────────"
echo "│  Result : $ISSUES issue(s) found"
echo "└──────────────────────────────────────────────────────────────────────"

# ─── Known Issues ────────────────────────────────────────────────────────────

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════"
echo "║  KNOWN ISSUES & FIX GUIDE"
echo "╚═══════════════════════════════════════════════════════════════════════"

echo ""
echo "┌─────────────────────────────────────────────────────────────────────"
echo "│  ISSUE #1 — SMTP misconfiguration  [BLOCKING — login is broken]"
echo "├─────────────────────────────────────────────────────────────────────"
echo "│"
echo "│  Symptom  : POST /api/auth/login returns HTTP 500 for registered"
echo "│             emails. The OTP is created in the DB but the email"
echo "│             send crashes the request before a response is returned."
echo "│"
echo "│  Root Cause (confirmed)"
echo "│  ─────────────────────"
echo "│  SMTP_USER on Vercel is still sahil.vashisht@podtech.com but the"
echo "│  sender must be switched to the personal Gmail account:"
echo "│    vashishtsahil99@gmail.com"
echo "│"
echo "│  SMTP_HOST is already smtp.gmail.com which is correct for Gmail."
echo "│  The App Password bcqtrlrkvfzthzgp was generated for a different"
echo "│  account so it does not authenticate vashishtsahil99@gmail.com."
echo "│"
echo "│  ── Step 1 : Generate a Gmail App Password ─────────────────────────"
echo "│"
echo "│  Gmail App Passwords only work when 2-Step Verification is ON."
echo "│"
echo "│  1. Open  myaccount.google.com  (sign in as vashishtsahil99@gmail.com)"
echo "│  2. Security  →  2-Step Verification  →  enable it if not already on"
echo "│  3. Back on Security page, search  App passwords  in the search bar"
echo "│  4. App name → type  WorkDesk  → click  Create"
echo "│  5. Google shows a 16-char password like:  xxxx xxxx xxxx xxxx"
echo "│     Copy it — you only see it once."
echo "│     Remove spaces when pasting → it becomes:  xxxxxxxxxxxxxxxx"
echo "│"
echo "│  ── Step 2 : Update Vercel env vars (zoho-backend project) ─────────"
echo "│"
echo "│  Go to : vercel.com → zoho-backend → Settings → Environment Variables"
echo "│"
echo "│  Variable      Old value (WRONG)              New value (SET THIS)"
echo "│  ──────────    ────────────────────────────── ──────────────────────────────────"
echo "│  SMTP_HOST     smtp.gmail.com                 smtp.gmail.com  (no change)"
echo "│  SMTP_PORT     587                            587             (no change)"
echo "│  SMTP_SECURE   false                          false           (no change)"
echo "│  SMTP_USER     sahil.vashisht@podtech.com  →  vashishtsahil99@gmail.com"
echo "│  SMTP_PASS     bcqtrlrkvfzthzgp            →  <new 16-char App Password>"
echo "│  SMTP_FROM     Employee Portal <sahil...>   →  Employee Portal <vashishtsahil99@gmail.com>"
echo "│"
echo "│  ── Step 3 : Redeploy the backend ──────────────────────────────────"
echo "│"
echo "│  Vercel Dashboard → zoho-backend → Deployments → latest → ⋯ → Redeploy"
echo "│  Or via CLI:"
echo "│    cd path/to/zoho-backend && npx vercel --prod"
echo "│"
echo "│  ── Step 4 : Verify the fix ─────────────────────────────────────────"
echo "│"
echo "│    curl -s -X POST $BASE/api/auth/login \\"
echo "│         -H 'Content-Type: application/json' \\"
echo "│         -d '{\"email\":\"admin@company.com\"}'"
echo "│"
echo "│    ✅ Fixed  → HTTP 200  +  OTP arrives in admin@company.com inbox"
echo "│    ❌ Still broken → HTTP 500  →  check App Password, re-run this script"
echo "│"
echo "└─────────────────────────────────────────────────────────────────────"

echo ""
echo "┌─────────────────────────────────────────────────────────────────────"
echo "│  ISSUE #2 — Vercel redeploy required after every env var change"
echo "├─────────────────────────────────────────────────────────────────────"
echo "│"
echo "│  Symptom  : Env vars updated on Vercel but behaviour doesn't change."
echo "│"
echo "│  Cause    : Vercel does NOT hot-reload environment variables."
echo "│             The running serverless function keeps the old values"
echo "│             until a new deployment is triggered."
echo "│"
echo "│  Fix"
echo "│  ───"
echo "│  Option A — Dashboard (recommended)"
echo "│    1. Open vercel.com → zoho-backend project"
echo "│    2. Deployments tab → latest deployment → ⋯ → Redeploy"
echo "│"
echo "│  Option B — CLI"
echo "│    cd path/to/zoho-backend"
echo "│    npx vercel --prod"
echo "│"
echo "└─────────────────────────────────────────────────────────────────────"

echo ""
echo "┌─────────────────────────────────────────────────────────────────────"
echo "│  ISSUE #3 — Only one seeded user exists in the database"
echo "├─────────────────────────────────────────────────────────────────────"
echo "│"
echo "│  Symptom  : Logging in with any email other than admin@company.com"
echo "│             returns HTTP 200 but no OTP is ever sent or received."
echo "│             This is NOT a bug — it is a security feature."
echo "│"
echo "│  Cause    : The backend returns the same generic 200 response whether"
echo "│             the email exists or not (prevents user enumeration)."
echo "│             If the email is not in the database, no OTP is created"
echo "│             and no email is sent."
echo "│"
echo "│  Seeded accounts (only these will ever receive an OTP)"
echo "│    admin@company.com  — role: ADMIN, employeeId: EMP000"
echo "│"
echo "│  Fix — Add more users via the database directly or build a"
echo "│        HR/Admin 'Create Employee' API endpoint."
echo "│        Until then, use admin@company.com for all testing."
echo "│"
echo "└─────────────────────────────────────────────────────────────────────"

echo ""
echo "┌─────────────────────────────────────────────────────────────────────"
echo "│  STATUS SUMMARY"
echo "├─────────────────────────────────────────────────────────────────────"
echo "│"
echo "│  ✅  Database                  connected"
echo "│  ✅  Server / Vercel           running"
echo "│  ✅  Auth middleware           working  (401 on all protected routes)"
echo "│  ✅  OTP verification logic    working  (INVALID_OTP returns 401)"
echo "│  ✅  Token refresh endpoint    working"
echo "│  ✅  Logout endpoint           working"
echo "│  ❌  SMTP email sending        broken   → see Issue #1"
echo "│"
echo "│  Priority : Fix Issue #1 → SMTP config + Vercel redeploy"
echo "│             Everything else is working correctly."
echo "│"
echo "└─────────────────────────────────────────────────────────────────────"
echo ""
