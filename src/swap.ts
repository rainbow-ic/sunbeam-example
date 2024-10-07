import { HttpAgent } from "@dfinity/agent";

export const swap = async ({
  amount,
  agent,
  poolCanisterId,
  swapToken,
}: {
  // actual number * 10^decimals
  amount: number;
  agent: HttpAgent;
  poolCanisterId: string;
  swapToken: string;
}) => {
  try {
    const swapService = SwapPoolFactory.create({
      dex: SupportedDEX.ICPSwap,
      initArgs: {
        id: poolCanisterId,
        agent,
      },
    });

    const metadata = await swapService.getMetadata();

    const zeroForOne = metadata.token0.address === swapToken;
    const slippage = 0;

    const swapRes = await swapService.swap({
      amountIn: amount.toString(),
      zeroForOne,
      amountOutMinimum: slippage.toString(),
    });

    return swapRes;
  } catch (error) {
    console.error(error);
  }
};
