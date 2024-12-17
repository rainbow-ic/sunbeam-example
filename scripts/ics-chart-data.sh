#!/bin/bash

# Run the dfx canister call command and format the output with jq
dfx canister --network=ic call moe7a-tiaaa-aaaag-qclfq-cai getTokenPricesData '("ryjl3-tyaaa-aaaaa-aaaba-cai", 0, 86400, 100)' --output json | jq > token_prices_data.json

# Notify the user
echo "Output written to token_prices_data.json"