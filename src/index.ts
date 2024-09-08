import { swap } from "./swap";
import { listTokens } from "./listTokens";
import { getPairWithIcp, getPoolsForToken } from "./getPoolsForToken";

const CKUSDT_CANISTER_ID = "cngnf-vqaaa-aaaar-qag4q-cai";

// swap();
// listTokens();
const main = async () => {
    const pools = await getPoolsForToken(CKUSDT_CANISTER_ID);

    const pool = getPairWithIcp(pools);

    console.log("all pools", pools);
    console.log("CKUSDT_ICP", pool);

    // swap icp to ckusdt
};

main();
