import { HttpAgent } from "@dfinity/agent";
import { DexFactory, SupportedDEX } from "@rainbow-ic/sunbeam";

export const listTokens = async () => {
    const agent = await HttpAgent.create({ host: "https://ic0.app" });

    const icpswap = DexFactory.create({
        dex: SupportedDEX.ICPSwap,
        initArgs: {
            agent,
        },
    });

    const tokens = await icpswap.listTokens();

    return tokens;
};
