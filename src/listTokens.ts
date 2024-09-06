import { HttpAgent } from "@dfinity/agent";
import {
  DexFactory,
  ICPSWAP_NODE_INDEX_CANISTER,
  SupportedDEX,
} from "@rainbow-ic/sunbeam";

export const listTokens = async () => {
  const agent = new HttpAgent({ host: "https://ic0.app" });

  const icpswap = await DexFactory.create({
    dex: SupportedDEX.ICPSwap,
    initArgs: {
      agent,
    },
  });

  const tokens = await icpswap.listTokens();
  console.log("[tokens]", tokens);
};
