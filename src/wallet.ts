import { Ed25519KeyIdentity } from "@dfinity/identity";
import * as nacl from "tweetnacl";
import * as bip39 from "bip39";
import { Principal } from "@dfinity/principal";
import { AccountIdentifier, SubAccount } from "@dfinity/ledger-icp";
import dotenv from "dotenv";
dotenv.config();

export type Wallet = {
    mainAccount: AccountIdentifier;
    accountIdentifier: AccountIdentifier;
    subaccount: SubAccount;
    principal: Principal;
    identity: Ed25519KeyIdentity;
};

// Stoic compatible wallet
export const initWallet = (mnemonic: string): Wallet => {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const keyPair = nacl.sign.keyPair.fromSeed(seed.subarray(0, 32));
    const privateKey = keyPair.secretKey.slice(0, 32);
    //public things
    const identity = Ed25519KeyIdentity.fromSecretKey(privateKey);
    const principal = identity.getPrincipal();
    const principalSubAccount = SubAccount.fromPrincipal(principal);

    const mainAccount = AccountIdentifier.fromPrincipal({
        principal: principal,
    });
    const accountIdentifier = AccountIdentifier.fromPrincipal({
        principal: principal,
        subAccount: principalSubAccount,
    });

    return {
        mainAccount,
        accountIdentifier,
        principal,
        subaccount: principalSubAccount,
        identity,
    };
};
