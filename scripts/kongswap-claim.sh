FAUCET_CANISTER="ohr23-xqaaa-aaaar-qahqq-cai"

CKUSDT_CANISTER="zdzgz-siaaa-aaaar-qaiba-cai"

CLAIM_WALLET="aqwf6-vlwzu-7jwxh-abe6t-5irfu-62w7m-caq6j-dzto5-saabm-ru5sz-aae"

PAY_AMOUNT=80_000_000

dfx canister call --ic $FAUCET_CANISTER claim '()'

dfx canister call --ic $CKUSDT_CANISTER icrc1_transfer "(record {
    to = record {
        owner = principal \"${CLAIM_WALLET}\";
        subaccount = null;
    };
    amount = $PAY_AMOUNT
})"
