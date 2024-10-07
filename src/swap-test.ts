import chalkAnimation from "chalk-animation";
import search from "@inquirer/search";

import { HttpAgent } from "@dfinity/agent";
import { initWallet } from "./wallet";
import { getPairWithIcp, getPoolsForToken } from "./getPoolsForToken";
import { ICPSwap } from "@rainbow-ic/sunbeam";

// Display welcome message
chalkAnimation.rainbow("Welcome to Swap Terminal");

const main = async () => {
  // Recreate the wallet from a seed phrase
  const wallet = initWallet(process.env.SEED as string);
  const agent = await HttpAgent.create({ host: "https://ic0.app" });
  agent.replaceIdentity(wallet.identity);
  const pid = await agent.getPrincipal();
  console.log(`Principal ID: ${pid.toText()}`);

  /// Create a dex instance
  const dex = new ICPSwap({
    agent,
  });

  /// Fetch all available tokens
  const tokens = await dex.listTokens();

  // Prompt the user to select a token
  const tokenCanisterId = await search({
    message: "Select a token: ",
    source: async (input, { signal }) => {
      const response = tokens.filter(
        (t) => !input || t.name.toLowerCase().includes(input.toLowerCase())
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

  // Fetch all available trading pairs for the selected token
  const pools = await dex.listPools(
    {
      address: tokenCanisterId,
      symbol: "",
      name: "",
    },
    {}
  );

  /// Prompt the user to select a pool
  const pool = getPairWithIcp(pools);

  console.log("pool:", pool);

  const metadata = await pool.getMetadata();
  console.log("pool metadata", metadata);

  const minOut = 0;

  const swapRes = await pool.swap({
    amountIn: "10000000",
    zeroForOne: false,
    amountOutMinimum: minOut.toString(),
  });

  console.log("swapRes", swapRes);
};

main();
