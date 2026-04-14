#!/usr/bin/env sh
set -e

# Function to generate a random base64 encoded string of 16 bytes
generate_random_base64() {
    openssl rand -base64 12
}

# Generate random values for each variable
ADMIN_JWT_SECRET=$(generate_random_base64)
API_TOKEN_SALT=$(generate_random_base64)
JWT_SECRET=$(generate_random_base64)
TRANSFER_TOKEN_SALT=$(generate_random_base64)

# Generate 4 random keys for APP_KEYS
NUM_APP_KEYS=4
app_keys=()
for ((i=0; i<NUM_APP_KEYS; i++)); do
    app_keys+=("$(generate_random_base64)")
done
APP_KEYS=$(IFS=,; echo "${app_keys[*]}")

# Output the result in the desired format
echo "ADMIN_JWT_SECRET=$ADMIN_JWT_SECRET"
echo "API_TOKEN_SALT=$API_TOKEN_SALT"
echo "APP_KEYS=$APP_KEYS"
echo "JWT_SECRET=$JWT_SECRET"
echo "TRANSFER_TOKEN_SALT=$TRANSFER_TOKEN_SALT"
echo
