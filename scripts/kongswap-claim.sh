FAUCET_CANISTER="ohr23-xqaaa-aaaar-qahqq-cai"

CKUSDT_CANISTER="zdzgz-siaaa-aaaar-qaiba-cai"

CLAIM_WALLET="tnpkb-asm5y-7bfpb-ft7ee-7hq4j-wdixs-lenks-syvfm-nbowf-mgvtf-hae"

PAY_AMOUNT=80_000_000

dfx canister call --ic $FAUCET_CANISTER claim '()'

dfx canister call --ic $CKUSDT_CANISTER icrc1_transfer "(record {
    to = record {
        owner = principal \"${CLAIM_WALLET}\";
        subaccount = null;
    };
    amount = $PAY_AMOUNT
})"
