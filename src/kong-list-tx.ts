import { Agent, HttpAgent } from "@dfinity/agent";
import { KongSwap, KONGSWAP_BACKEND_CANISTER } from "@rainbow-ic/sunbeam";

const main = async () => {
  const agent: Agent = HttpAgent.createSync({
    host: "https://ic0.app",
  });

  const kongswap = new KongSwap({
    agent,
    address: KONGSWAP_BACKEND_CANISTER,
  });

  const tx = await kongswap.getTransactions();

  // console.log(pools);
  console.log(tx);
};

main();
