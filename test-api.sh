#!/bin/bash
#
# E-commerce Order Processing System — API Test Script
# Requires: curl, jq (optional but recommended)
#
# Usage:
#   chmod +x test-api.sh
#   ./test-api.sh
#
# The server must be running on localhost:3000 before executing.

BASE_URL="http://localhost:3000"
PASS=0
FAIL=0
TOTAL=0

# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

json_field() {
  # Extract a field from JSON response wrapped in { status, message, data }.
  # Looks inside data first, falls back to top-level.
  local json="$1" field="$2"
  if command -v jq &>/dev/null; then
    local val
    val=$(echo "$json" | jq -r ".data.$field // .$field" 2>/dev/null)
    echo "$val"
  else
    echo "$json" | tr -d '\n\r' | grep -o "\"$field\"[[:space:]]*:[[:space:]]*[^,}]*" | head -1 | sed "s/\"$field\"[[:space:]]*:[[:space:]]*//;s/\"//g;s/[[:space:]]//g"
  fi
}

assert_status() {
  local test_name="$1" expected="$2" actual="$3"
  TOTAL=$((TOTAL + 1))
  if [ "$actual" -eq "$expected" ]; then
    echo -e "  ${GREEN}✓ PASS${NC} [$actual] $test_name"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗ FAIL${NC} [$actual expected $expected] $test_name"
    FAIL=$((FAIL + 1))
  fi
}

section() {
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}  $1${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ──────────────────────────────────────────────
# Preflight
# ──────────────────────────────────────────────

echo -e "${BOLD}Order Processing System — API Test Suite${NC}"
echo "Target: $BASE_URL"
echo ""

# Check server is running
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$HTTP_CODE" != "200" ]; then
  echo -e "${RED}ERROR: Server is not running at $BASE_URL (got HTTP $HTTP_CODE)${NC}"
  echo "Start the server first: npm run start:dev"
  exit 1
fi
echo -e "${GREEN}Server is reachable.${NC}"

# Use a unique suffix so tests are idempotent
TS=$(date +%s)
ADMIN_EMAIL="admin_${TS}@test.com"
CUSTOMER_EMAIL="customer_${TS}@test.com"
CUSTOMER2_EMAIL="customer2_${TS}@test.com"

# ══════════════════════════════════════════════
#  1. AUTH — Registration & Login
# ══════════════════════════════════════════════

section "1. AUTH — Registration"

# Register admin (will be CUSTOMER first, promoted later)
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"admin123\",\"name\":\"Test Admin\"}")
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
assert_status "Register admin user" 201 "$CODE"

# Register customer
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"cust1234\",\"name\":\"Test Customer\"}")
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
assert_status "Register customer user" 201 "$CODE"

# Register second customer (for cross-user tests)
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$CUSTOMER2_EMAIL\",\"password\":\"cust5678\",\"name\":\"Other Customer\"}")
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
assert_status "Register second customer" 201 "$CODE"

# Duplicate registration should fail
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"cust1234\",\"name\":\"Duplicate\"}")
CODE=$(echo "$RESP" | tail -1)
assert_status "Duplicate email rejected (409)" 409 "$CODE"

# Validation: short password
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"bad@test.com\",\"password\":\"123\",\"name\":\"Bad\"}")
CODE=$(echo "$RESP" | tail -1)
assert_status "Short password rejected (400)" 400 "$CODE"

section "1b. AUTH — Login"

# Login admin
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"admin123\"}")
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
assert_status "Admin login" 200 "$CODE"
ADMIN_TOKEN=$(json_field "$BODY" "access_token")

# Login customer
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"cust1234\"}")
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
assert_status "Customer login" 200 "$CODE"
CUST_TOKEN=$(json_field "$BODY" "access_token")

# Login second customer
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$CUSTOMER2_EMAIL\",\"password\":\"cust5678\"}")
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
assert_status "Second customer login" 200 "$CODE"
CUST2_TOKEN=$(json_field "$BODY" "access_token")

# Bad credentials
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"wrongpass\"}")
CODE=$(echo "$RESP" | tail -1)
assert_status "Wrong password rejected (401)" 401 "$CODE"

# ──────────────────────────────────────────────
# Promote admin user in the database
# ──────────────────────────────────────────────

echo ""
echo -e "${YELLOW}  Promoting admin user via Prisma...${NC}"
cd "$(dirname "$0")"
echo "UPDATE \"User\" SET role='ADMIN' WHERE email='$ADMIN_EMAIL';" | npx prisma db execute --stdin 2>/dev/null
sleep 2

# Re-login admin to get token with ADMIN role
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"admin123\"}")
BODY=$(echo "$RESP" | sed '$d')
ADMIN_TOKEN=$(json_field "$BODY" "access_token")
echo -e "${YELLOW}  Admin re-logged in with ADMIN role.${NC}"
sleep 1

# ══════════════════════════════════════════════
#  2. USERS — Profile & List
# ══════════════════════════════════════════════

section "2. USERS — Profile & List"

# Customer gets own profile
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users/profile" \
  -H "Authorization: Bearer $CUST_TOKEN")
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
assert_status "Customer gets own profile" 200 "$CODE"

# Unauthenticated profile access
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users/profile")
CODE=$(echo "$RESP" | tail -1)
assert_status "Unauthenticated profile rejected (401)" 401 "$CODE"

# Admin lists all users
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Admin lists all users" 200 "$CODE"

# Customer cannot list all users
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $CUST_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Customer cannot list users (403)" 403 "$CODE"

# ══════════════════════════════════════════════
#  3. PRODUCTS — CRUD
# ══════════════════════════════════════════════

section "3. PRODUCTS — Admin CRUD"

# Admin creates product 1
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name":"Wireless Mouse","description":"Ergonomic wireless mouse","price":29.99,"stock":50}')
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
assert_status "Admin creates product 1" 201 "$CODE"
PRODUCT1_ID=$(json_field "$BODY" "id")

# Admin creates product 2
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name":"USB-C Cable","description":"Fast charging cable","price":9.99,"stock":100}')
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
assert_status "Admin creates product 2" 201 "$CODE"
PRODUCT2_ID=$(json_field "$BODY" "id")

# Admin updates product
RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/products/$PRODUCT1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"price":24.99}')
CODE=$(echo "$RESP" | tail -1)
assert_status "Admin updates product price" 200 "$CODE"

# Customer CANNOT create product
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUST_TOKEN" \
  -d '{"name":"Hack","price":1,"stock":1}')
CODE=$(echo "$RESP" | tail -1)
assert_status "Customer cannot create product (403)" 403 "$CODE"

# Customer CANNOT update product
RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/products/$PRODUCT1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUST_TOKEN" \
  -d '{"price":0.01}')
CODE=$(echo "$RESP" | tail -1)
assert_status "Customer cannot update product (403)" 403 "$CODE"

# Customer CANNOT delete product
RESP=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/products/$PRODUCT1_ID" \
  -H "Authorization: Bearer $CUST_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Customer cannot delete product (403)" 403 "$CODE"

section "3b. PRODUCTS — Public Access"

# Public: list all products (no auth)
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/products")
CODE=$(echo "$RESP" | tail -1)
assert_status "Public can list products" 200 "$CODE"

# Public: get single product (no auth)
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/products/$PRODUCT1_ID")
CODE=$(echo "$RESP" | tail -1)
assert_status "Public can get product by ID" 200 "$CODE"

# Non-existent product
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/products/99999")
CODE=$(echo "$RESP" | tail -1)
assert_status "Non-existent product (404)" 404 "$CODE"

# ══════════════════════════════════════════════
#  4. ORDERS — Create
# ══════════════════════════════════════════════

section "4. ORDERS — Create"

# Customer creates order
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUST_TOKEN" \
  -d "{\"items\":[{\"productId\":$PRODUCT1_ID,\"quantity\":2},{\"productId\":$PRODUCT2_ID,\"quantity\":3}]}")
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
assert_status "Customer creates order" 201 "$CODE"
ORDER1_ID=$(json_field "$BODY" "id")

# Second customer creates order
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUST2_TOKEN" \
  -d "{\"items\":[{\"productId\":$PRODUCT2_ID,\"quantity\":1}]}")
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
assert_status "Second customer creates order" 201 "$CODE"
ORDER2_ID=$(json_field "$BODY" "id")

# Unauthenticated order creation
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":1,"quantity":1}]}')
CODE=$(echo "$RESP" | tail -1)
assert_status "Unauthenticated order rejected (401)" 401 "$CODE"

# Empty items validation
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUST_TOKEN" \
  -d '{"items":[]}')
CODE=$(echo "$RESP" | tail -1)
assert_status "Empty items rejected (400)" 400 "$CODE"

# Non-existent product in order
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUST_TOKEN" \
  -d '{"items":[{"productId":99999,"quantity":1}]}')
CODE=$(echo "$RESP" | tail -1)
assert_status "Non-existent product in order (400)" 400 "$CODE"

# ══════════════════════════════════════════════
#  5. ORDERS — Retrieve & List
# ══════════════════════════════════════════════

section "5. ORDERS — Retrieve & Ownership"

# Customer gets own order
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/orders/$ORDER1_ID" \
  -H "Authorization: Bearer $CUST_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Customer gets own order" 200 "$CODE"

# Customer CANNOT see other customer's order
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/orders/$ORDER2_ID" \
  -H "Authorization: Bearer $CUST_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Customer cannot see other's order (403)" 403 "$CODE"

# Admin can see any order
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/orders/$ORDER2_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Admin can see any order" 200 "$CODE"

# Customer lists own orders only
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/orders" \
  -H "Authorization: Bearer $CUST_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Customer lists own orders" 200 "$CODE"

# Admin lists all orders
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/orders" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Admin lists all orders" 200 "$CODE"

# Filter by status
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/orders?status=PENDING" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Filter orders by status" 200 "$CODE"

# Non-existent order
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/orders/99999" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Non-existent order (404)" 404 "$CODE"

# ══════════════════════════════════════════════
#  6. ORDERS — Cancel
# ══════════════════════════════════════════════

section "6. ORDERS — Cancel"

# Customer cancels own PENDING order
RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/orders/$ORDER1_ID/cancel" \
  -H "Authorization: Bearer $CUST_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Customer cancels own PENDING order" 200 "$CODE"

# Cannot cancel again (already CANCELLED)
RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/orders/$ORDER1_ID/cancel" \
  -H "Authorization: Bearer $CUST_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Cannot cancel already cancelled order (400)" 400 "$CODE"

# Customer CANNOT cancel other customer's order
RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/orders/$ORDER2_ID/cancel" \
  -H "Authorization: Bearer $CUST_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Customer cannot cancel other's order (403)" 403 "$CODE"

# Admin CAN cancel any PENDING order
RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/orders/$ORDER2_ID/cancel" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Admin cancels any PENDING order" 200 "$CODE"

# ══════════════════════════════════════════════
#  7. ORDERS — Status Transitions (Admin)
# ══════════════════════════════════════════════

section "7. ORDERS — Status Transitions"

# Create a fresh order for status transition tests
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUST_TOKEN" \
  -d "{\"items\":[{\"productId\":$PRODUCT2_ID,\"quantity\":1}]}")
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
ORDER3_ID=$(json_field "$BODY" "id")
echo -e "  ${YELLOW}Created order #$ORDER3_ID for status tests${NC}"

# Customer CANNOT update status (admin only)
RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/orders/$ORDER3_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUST_TOKEN" \
  -d '{"status":"PROCESSING"}')
CODE=$(echo "$RESP" | tail -1)
assert_status "Customer cannot update status (403)" 403 "$CODE"

# PENDING → PROCESSING
RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/orders/$ORDER3_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status":"PROCESSING"}')
CODE=$(echo "$RESP" | tail -1)
assert_status "PENDING → PROCESSING" 200 "$CODE"

# Cannot skip: PROCESSING → DELIVERED (invalid)
RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/orders/$ORDER3_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status":"DELIVERED"}')
CODE=$(echo "$RESP" | tail -1)
assert_status "Cannot skip status (400)" 400 "$CODE"

# Cannot go backward: PROCESSING → PENDING (invalid)
RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/orders/$ORDER3_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status":"PENDING"}')
CODE=$(echo "$RESP" | tail -1)
assert_status "Cannot go backward (400)" 400 "$CODE"

# PROCESSING → SHIPPED
RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/orders/$ORDER3_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status":"SHIPPED"}')
CODE=$(echo "$RESP" | tail -1)
assert_status "PROCESSING → SHIPPED" 200 "$CODE"

# SHIPPED → DELIVERED
RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/orders/$ORDER3_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status":"DELIVERED"}')
CODE=$(echo "$RESP" | tail -1)
assert_status "SHIPPED → DELIVERED" 200 "$CODE"

# Cannot update past DELIVERED
RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/orders/$ORDER3_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status":"DELIVERED"}')
CODE=$(echo "$RESP" | tail -1)
assert_status "Cannot update past DELIVERED (400)" 400 "$CODE"

# Cannot cancel non-PENDING order
RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/orders/$ORDER3_ID/cancel" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Cannot cancel DELIVERED order (400)" 400 "$CODE"

# ══════════════════════════════════════════════
#  8. PRODUCTS — Delete (Admin)
# ══════════════════════════════════════════════

section "8. PRODUCTS — Delete"

# Create a throwaway product to delete
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name":"Throwaway","price":1.00,"stock":1}')
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
DEL_ID=$(json_field "$BODY" "id")
assert_status "Admin creates throwaway product" 201 "$CODE"

RESP=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/products/$DEL_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Admin deletes product" 200 "$CODE"

# Verify it's gone
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/products/$DEL_ID")
CODE=$(echo "$RESP" | tail -1)
assert_status "Deleted product returns 404" 404 "$CODE"

# ══════════════════════════════════════════════
#  9. AUDIT LOGS
# ══════════════════════════════════════════════

section "9. AUDIT LOGS"

# Admin gets audit log for order that went through full lifecycle (ORDER3)
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/orders/$ORDER3_ID/audit-log" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
assert_status "Admin gets audit log for order" 200 "$CODE"

# Verify multiple audit entries exist (creation + status transitions)
if command -v jq &>/dev/null; then
  LOG_COUNT=$(echo "$BODY" | jq '.data.items | length')
  TOTAL=$((TOTAL + 1))
  if [ "$LOG_COUNT" -ge 4 ]; then
    echo -e "  ${GREEN}✓ PASS${NC} [count=$LOG_COUNT] Audit log has >= 4 entries (create + 3 transitions)"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗ FAIL${NC} [count=$LOG_COUNT expected >= 4] Audit log entry count"
    FAIL=$((FAIL + 1))
  fi
else
  echo -e "  ${YELLOW}  SKIP${NC} Audit log count check (jq not available)"
fi

# Admin gets audit log for cancelled order (ORDER1)
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/orders/$ORDER1_ID/audit-log" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
assert_status "Admin gets audit log for cancelled order" 200 "$CODE"

# Verify cancel event is logged
if command -v jq &>/dev/null; then
  HAS_CANCEL=$(echo "$BODY" | jq '[.data.items[] | select(.action == "ORDER_CANCELLED")] | length')
  TOTAL=$((TOTAL + 1))
  if [ "$HAS_CANCEL" -ge 1 ]; then
    echo -e "  ${GREEN}✓ PASS${NC} ORDER_CANCELLED action present in audit log"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗ FAIL${NC} ORDER_CANCELLED action missing from audit log"
    FAIL=$((FAIL + 1))
  fi
else
  echo -e "  ${YELLOW}  SKIP${NC} Cancel event check (jq not available)"
fi

# Customer CANNOT access audit logs
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/orders/$ORDER1_ID/audit-log" \
  -H "Authorization: Bearer $CUST_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Customer cannot access order audit log (403)" 403 "$CODE"

# Admin lists all audit logs
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/orders/audit-logs/all" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Admin lists all audit logs" 200 "$CODE"

# Admin filters audit logs by action
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/orders/audit-logs/all?action=ORDER_CREATED" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
assert_status "Admin filters audit logs by action" 200 "$CODE"

# Verify filtered results only contain ORDER_CREATED
if command -v jq &>/dev/null; then
  NON_CREATE=$(echo "$BODY" | jq '[.data.items[] | select(.action != "ORDER_CREATED")] | length')
  TOTAL=$((TOTAL + 1))
  if [ "$NON_CREATE" -eq 0 ]; then
    echo -e "  ${GREEN}✓ PASS${NC} Filter returns only ORDER_CREATED entries"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗ FAIL${NC} Filter returned non-ORDER_CREATED entries"
    FAIL=$((FAIL + 1))
  fi
else
  echo -e "  ${YELLOW}  SKIP${NC} Filter verification (jq not available)"
fi

# Admin filters audit logs by orderId
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/orders/audit-logs/all?orderId=$ORDER3_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Admin filters audit logs by orderId" 200 "$CODE"

# Customer CANNOT access all audit logs
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/orders/audit-logs/all" \
  -H "Authorization: Bearer $CUST_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Customer cannot access all audit logs (403)" 403 "$CODE"

# Unauthenticated cannot access audit logs
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/orders/audit-logs/all")
CODE=$(echo "$RESP" | tail -1)
assert_status "Unauthenticated cannot access audit logs (401)" 401 "$CODE"

# ══════════════════════════════════════════════
#  10. PAGINATION
# ══════════════════════════════════════════════

section "10. PAGINATION"

# Products pagination with limit=1
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/products?page=1&limit=1")
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
assert_status "Products pagination page=1 limit=1" 200 "$CODE"

if command -v jq &>/dev/null; then
  ITEMS_LEN=$(echo "$BODY" | jq '.data.items | length')
  META_PAGE=$(echo "$BODY" | jq '.data.meta.page')
  META_LIMIT=$(echo "$BODY" | jq '.data.meta.limit')
  META_TOTAL=$(echo "$BODY" | jq '.data.meta.totalItems')
  META_PAGES=$(echo "$BODY" | jq '.data.meta.totalPages')

  TOTAL=$((TOTAL + 1))
  if [ "$ITEMS_LEN" -eq 1 ] && [ "$META_PAGE" -eq 1 ] && [ "$META_LIMIT" -eq 1 ]; then
    echo -e "  ${GREEN}✓ PASS${NC} Pagination returns 1 item with correct meta"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗ FAIL${NC} Pagination meta incorrect (items=$ITEMS_LEN page=$META_PAGE limit=$META_LIMIT)"
    FAIL=$((FAIL + 1))
  fi

  TOTAL=$((TOTAL + 1))
  if [ "$META_TOTAL" -ge 2 ] && [ "$META_PAGES" -ge 2 ]; then
    echo -e "  ${GREEN}✓ PASS${NC} totalItems=$META_TOTAL totalPages=$META_PAGES"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗ FAIL${NC} totalItems=$META_TOTAL totalPages=$META_PAGES (expected >= 2)"
    FAIL=$((FAIL + 1))
  fi
else
  echo -e "  ${YELLOW}  SKIP${NC} Pagination meta checks (jq not available)"
fi

# Orders pagination
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/orders?page=1&limit=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Orders pagination page=1 limit=1" 200 "$CODE"

# Users pagination
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users?page=1&limit=2" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status "Users pagination page=1 limit=2" 200 "$CODE"

# Page 2 of products
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/products?page=2&limit=1")
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -1)
assert_status "Products page 2" 200 "$CODE"

# Invalid pagination (limit > 100)
RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/products?limit=200")
CODE=$(echo "$RESP" | tail -1)
assert_status "Limit > 100 rejected (400)" 400 "$CODE"

# ══════════════════════════════════════════════
#  11. RATE LIMITING
# ══════════════════════════════════════════════

section "11. RATE LIMITING"

# Fire 12 rapid login requests (limit is 10/min on auth routes)
RATE_LIMIT_HIT=0
for i in $(seq 1 12); do
  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"ratelimit_${TS}@test.com\",\"password\":\"doesntmatter\"}")
  CODE=$(echo "$RESP" | tail -1)
  if [ "$CODE" -eq 429 ]; then
    RATE_LIMIT_HIT=1
    break
  fi
done

TOTAL=$((TOTAL + 1))
if [ "$RATE_LIMIT_HIT" -eq 1 ]; then
  echo -e "  ${GREEN}✓ PASS${NC} Rate limiter returned 429 after rapid requests"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗ FAIL${NC} Rate limiter did not trigger (no 429 received)"
  FAIL=$((FAIL + 1))
fi

# Global rate limit header check (X-RateLimit headers)
RESP=$(curl -s -D - -o /dev/null -X GET "$BASE_URL/products" 2>&1)
if echo "$RESP" | grep -qi "x-ratelimit"; then
  TOTAL=$((TOTAL + 1))
  echo -e "  ${GREEN}✓ PASS${NC} X-RateLimit headers present in response"
  PASS=$((PASS + 1))
else
  TOTAL=$((TOTAL + 1))
  echo -e "  ${YELLOW}  SKIP${NC} X-RateLimit headers not detected (may vary by throttler version)"
fi

# ══════════════════════════════════════════════
#  12. SWAGGER
# ══════════════════════════════════════════════

section "12. SWAGGER"

RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api-json")
CODE=$(echo "$RESP" | tail -1)
assert_status "Swagger JSON accessible" 200 "$CODE"

# ══════════════════════════════════════════════
#  SUMMARY
# ══════════════════════════════════════════════

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  TEST RESULTS${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Total:  ${BOLD}$TOTAL${NC}"
echo -e "  Passed: ${GREEN}$PASS${NC}"
echo -e "  Failed: ${RED}$FAIL${NC}"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}All tests passed!${NC}"
  echo ""
  exit 0
else
  echo -e "  ${RED}${BOLD}$FAIL test(s) failed.${NC}"
  echo ""
  exit 1
fi
