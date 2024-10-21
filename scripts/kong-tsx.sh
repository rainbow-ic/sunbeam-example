#!/bin/bash

# Run the dfx canister call command and format the output with jq
dfx canister call --ic l4lgk-raaaa-aaaar-qahpq-cai txs --output json "(null)" | jq > output.json

dfx canister call --ic l4lgk-raaaa-aaaar-qahpq-cai txs --output json "(opt true)" | jq > output2.json


# Notify the user
echo "Output written to output.json"