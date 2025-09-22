#!/bin/bash

# Script to create test data: customer, plan, user, subscription and charge
# This script creates all necessary entities in the correct order

set -e  # Exit on any error

echo "🚀 Starting test data creation..."

# Configuration
API_BASE_URL="http://18.219.10.15:3000/api"
#http://18.219.10.15:3000

# Admin user for authentication (needed for admin-only endpoints)
ADMIN_USER_DATA='{
  "email": "admin@test.com",
  "password": "admin123",
  "name": "Administrador Teste",
  "userType": "ADMIN"
}'


CUSTOMER_DATA='{
  "name": "Igor Falcão",
  "email": "igoraaf1@gmail.com",
  "phone": "+5511999999999"
}'

PLAN_DATA='{
  "name": "Plano Premium",
  "price": 59.90,
  "recurrence": "monthly",
  "description": "Plano premium com todas as funcionalidades",
  "active": true
}'

echo "📝 Creating admin user..."
ADMIN_USER_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/users" \
  -H "Content-Type: application/json" \
  -d "${ADMIN_USER_DATA}")

echo "Admin user response: ${ADMIN_USER_RESPONSE}"

# Extract admin user ID from response
ADMIN_USER_ID=$(echo "${ADMIN_USER_RESPONSE}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "${ADMIN_USER_ID}" ]; then
  echo "❌ Error: Failed to create admin user or extract ID"
  echo "Response: ${ADMIN_USER_RESPONSE}"
  exit 1
fi

echo "✅ Admin user created with ID: ${ADMIN_USER_ID}"

echo "🔐 Logging in with admin user..."
LOGIN_DATA='{
  "email": "admin@test.com",
  "password": "admin123"
}'

LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "${LOGIN_DATA}")

echo "Login response: ${LOGIN_RESPONSE}"

# Extract JWT token from response
JWT_TOKEN=$(echo "${LOGIN_RESPONSE}" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "${JWT_TOKEN}" ]; then
  echo "❌ Error: Failed to login or extract token"
  echo "Response: ${LOGIN_RESPONSE}"
  exit 1
fi

echo "✅ Successfully logged in and got JWT token"

# Function to make authenticated requests
make_authenticated_request() {
  local method="$1"
  local endpoint="$2"
  local data="$3"

  curl -s -X "${method}" "${API_BASE_URL}${endpoint}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    -d "${data}"
}

echo "📝 Creating customer..."
CUSTOMER_RESPONSE=$(make_authenticated_request "POST" "/customers" "${CUSTOMER_DATA}")

echo "Customer response: ${CUSTOMER_RESPONSE}"

# Extract customer ID from response
CUSTOMER_ID=$(echo "${CUSTOMER_RESPONSE}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "${CUSTOMER_ID}" ]; then
  echo "❌ Error: Failed to create customer or extract ID"
  echo "Response: ${CUSTOMER_RESPONSE}"
  exit 1
fi

echo "✅ Customer created with ID: ${CUSTOMER_ID}"

echo "📝 Creating plan..."
PLAN_RESPONSE=$(make_authenticated_request "POST" "/plans" "${PLAN_DATA}")

echo "Plan response: ${PLAN_RESPONSE}"

# Extract plan ID from response
PLAN_ID=$(echo "${PLAN_RESPONSE}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "${PLAN_ID}" ]; then
  echo "❌ Error: Failed to create plan or extract ID"
  echo "Response: ${PLAN_RESPONSE}"
  exit 1
fi

echo "✅ Plan created with ID: ${PLAN_ID}"

# Optional: Create regular user for testing (commented out as not required)
# echo "📝 Creating regular user..."
# USER_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/users" \
#   -H "Content-Type: application/json" \
#   -d "${USER_DATA}")
#
# echo "User response: ${USER_RESPONSE}"
#
# # Extract user ID from response
# USER_ID=$(echo "${USER_RESPONSE}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
#
# if [ -z "${USER_ID}" ]; then
#   echo "❌ Error: Failed to create user or extract ID"
#   echo "Response: ${USER_RESPONSE}"
#   exit 1
# fi
#
# echo "✅ Regular user created with ID: ${USER_ID}"

# Create subscription data with the IDs we just created
SUBSCRIPTION_DATA=$(cat <<EOF
{
  "customerId": "${CUSTOMER_ID}",
  "planId": "${PLAN_ID}",
  "startDate": "$(date -u +'%Y-%m-%dT%H:%M:%S.%3NZ')",
  "status": "active",
  "nextBilling": "$(date -u -d '+1 month' +'%Y-%m-%dT%H:%M:%S.%3NZ')"
}
EOF
)

echo "📝 Creating active subscription..."
SUBSCRIPTION_RESPONSE=$(make_authenticated_request "POST" "/active-subscriptions" "${SUBSCRIPTION_DATA}")

echo "Subscription response: ${SUBSCRIPTION_RESPONSE}"

# Extract subscription ID from response
SUBSCRIPTION_ID=$(echo "${SUBSCRIPTION_RESPONSE}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "${SUBSCRIPTION_ID}" ]; then
  echo "❌ Error: Failed to create subscription or extract ID"
  echo "Response: ${SUBSCRIPTION_RESPONSE}"
  exit 1
fi

echo "✅ Active subscription created with ID: ${SUBSCRIPTION_ID}"

# Create charge data with the subscription ID
CHARGE_DATA=$(cat <<EOF
{
  "subscriptionId": "${SUBSCRIPTION_ID}",
  "amount": 59.90,
  "chargeDate": "$(date -u +'%Y-%m-%dT%H:%M:%S.%3NZ')",
  "description": "Cobrança inicial do Plano Premium"
}
EOF
)

echo "📝 Creating charge..."
CHARGE_RESPONSE=$(make_authenticated_request "POST" "/charges" "${CHARGE_DATA}")

echo "Charge response: ${CHARGE_RESPONSE}"

# Extract charge ID from response
CHARGE_ID=$(echo "${CHARGE_RESPONSE}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "${CHARGE_ID}" ]; then
  echo "❌ Error: Failed to create charge or extract ID"
  echo "Response: ${CHARGE_RESPONSE}"
  exit 1
fi

echo "✅ Charge created with ID: ${CHARGE_ID}"

echo ""
echo "🎉 All test data created successfully!"
echo ""
echo "📊 Summary:"
echo "  Admin User ID: ${ADMIN_USER_ID} (email: admin@test.com)"
echo "  Customer ID: ${CUSTOMER_ID} (Igor Falcão)"
echo "  Plan ID: ${PLAN_ID} (Plano Premium - R$ 59.90)"
echo "  Subscription ID: ${SUBSCRIPTION_ID}"
echo "  Charge ID: ${CHARGE_ID} (R$ 59.90)"
echo ""
echo "🔐 Authentication:"
echo "  Admin login: email=admin@test.com, password=admin123"
echo "  Token: ${JWT_TOKEN:0:50}... (truncated for security)"
echo ""
echo "🔗 You can verify the data at:"
echo "  Customers: ${API_BASE_URL}/customers"
echo "  Plans: ${API_BASE_URL}/plans"
echo "  Users: ${API_BASE_URL}/users"
echo "  Subscriptions: ${API_BASE_URL}/active-subscriptions"
echo "  Charges: ${API_BASE_URL}/charges"
echo "  Health: ${API_BASE_URL}/../health"
