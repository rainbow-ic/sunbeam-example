import { HttpAgent } from "@dfinity/agent";
import { SupportedDEX, DexFactory, SwapPoolFactory } from "@rainbow-ic/sunbeam";
import { initWallet } from "./wallet";

// token 0 ckBTC, token 1 ICP
const canisterId = "xmiu5-jqaaa-aaaag-qbz7q-cai";

export const swap = async () => {
    try {
        const res = initWallet(process.env.SEED as string);

        console.log(res.principal.toString());

        const agent = await HttpAgent.create({ host: "https://ic0.app" });
        agent.replaceIdentity(res.identity);

        const pid = await agent.getPrincipal();

        console.log(`Principal ID: ${pid.toText()}`);

        const swapService = SwapPoolFactory.create({
            dex: SupportedDEX.ICPSwap,
            initArgs: {
                id: canisterId,
                agent,
            },
        });

        const metadata = await swapService.getMetadata();
        console.log("metadata", metadata);

        const slippage = 0;

        const swapRes = await swapService.swap({
            amountIn: "10000000",
            zeroForOne: false,
            amountOutMinimum: slippage.toString(),
        });

        console.log("swapRes", swapRes);
    } catch (error) {
        console.error(error);
    }
};
