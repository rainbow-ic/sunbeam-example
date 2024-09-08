import chalkAnimation from "chalk-animation";
import search from "@inquirer/search";

import { HttpAgent } from "@dfinity/agent";
import { DexFactory, SupportedDEX, SwapPoolFactory } from "@rainbow-ic/sunbeam";
import { initWallet } from "./wallet";
import { getPairWithIcp, getPoolsForToken } from "./getPoolsForToken";

// Display welcome message
chalkAnimation.rainbow("Welcome to Swap Terminal");

const main = async () => {
    const wallet = initWallet(process.env.SEED as string);

    console.log("wallet principal:", wallet.principal.toString());

    const agent = await HttpAgent.create({ host: "https://ic0.app" });
    agent.replaceIdentity(wallet.identity);

    const pid = await agent.getPrincipal();

    console.log(`Principal ID: ${pid.toText()}`);

    const icpswap = DexFactory.create({
        dex: SupportedDEX.ICPSwap,
        initArgs: {
            agent,
        },
    });

    const tokens = await icpswap.listTokens();

    // Prompt the user to search the list
    const tokenCanisterId = await search({
        message: "Select a token: ",
        source: async (input, { signal }) => {
            const response = tokens.filter(
                (t) => !input || t.name.toLowerCase().includes(input.toLowerCase()),
            );

            return response.map((t) => {
                return {
                    name: `${t.name} - (${t.symbol}) - ${t.address} - Vol 1d ${t.volumeUSD1d} - Vol 7d ${t.volumeUSD7d}`,
                    value: t.address,
                    description: t.symbol,
                };
            });
        },
    });

    const pools = await getPoolsForToken(tokenCanisterId);

    const pool = getPairWithIcp(pools);

    console.log("pool id", pool);

    const swapService = SwapPoolFactory.create({
        dex: SupportedDEX.ICPSwap,
        initArgs: {
            id: pool[0].pool,
            agent,
        },
    });

    const metadata = await swapService.getMetadata();
    console.log("metadata", metadata);

    const minOut = 0;

    const swapRes = await swapService.swap({
        amountIn: "10000000",
        zeroForOne: false,
        amountOutMinimum: minOut.toString(),
    });

    console.log("swapRes", swapRes);
};

main();
