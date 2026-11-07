#!/bin/bash
# Fills %PLACEHOLDER% patterns inside icecast.xml from environment variables,
# generating a random password for any password variable left empty.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ICECAST_CONFIG="$SCRIPT_DIR/../config/icecast.xml"
PASS_JSON="$SCRIPT_DIR/pass.json"

generate_password() {
    tr -dc 'A-Z0-9' < /dev/urandom | head -c 16
}

# Escapes a value for safe use as a sed replacement (delimiter is "|").
sed_escape_replacement() {
    printf '%s' "$1" | sed -e 's/[\&|]/\\&/g'
}

for pattern in HOSTNAME DISPLAY_ADMIN ADMIN_USER; do
    value="${!pattern}"
    sed -i "s|%${pattern}%|$(sed_escape_replacement "$value")|g" "$ICECAST_CONFIG"
    echo "Changed %${pattern}% to ${value} in Icecast config."
done

declare -A passwords=(
    [ICECAST_SOURCE_PASS]="$ICECAST_SOURCE_PASS"
    [ICECAST_RELAY_PASS]="$ICECAST_RELAY_PASS"
    [ICECAST_ADMIN_PASS]="$ICECAST_ADMIN_PASS"
)

for key in "${!passwords[@]}"; do
    if [ -z "${passwords[$key]}" ]; then
        passwords[$key]="$(generate_password)"
    fi
    sed -i "s|%${key}%|$(sed_escape_replacement "${passwords[$key]}")|g" "$ICECAST_CONFIG"
    echo "Changed %${key}% in Icecast config."
done

{
    printf '{'
    first=1
    for key in "${!passwords[@]}"; do
        [ "$first" -eq 0 ] && printf ','
        printf '"%s":"%s"' "$key" "${passwords[$key]}"
        first=0
    done
    printf '}'
} > "$PASS_JSON"
chown radiosa "$PASS_JSON"
chmod 600 "$PASS_JSON"

echo "Icecast config updated successfully."
