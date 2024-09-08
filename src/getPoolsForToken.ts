import { HttpAgent } from "@dfinity/agent";
import { DexFactory, SupportedDEX } from "@rainbow-ic/sunbeam";
import { PublicPoolOverView } from "@rainbow-ic/sunbeam/src/types/actors/icswap/icpswapNodeIndex";

const ICP_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";

export const getPoolsForToken = async (canisterId: string) => {
    const agent = await HttpAgent.create({ host: "https://ic0.app" });

    const icpswap = DexFactory.create({
        dex: SupportedDEX.ICPSwap,
        initArgs: {
            agent,
        },
    });

    const pools = await icpswap.getPoolsForToken(canisterId);

    return pools;
};

export const getPairWithIcp = (pools: PublicPoolOverView[]) => {
    return pools.filter(
        (pool) => pool.token1Id === ICP_CANISTER_ID || pool.token0Id === ICP_CANISTER_ID,
    );
};

export const getPair = () => {
    throw "Not implemented";
};
