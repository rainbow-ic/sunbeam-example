import chalkAnimation from "chalk-animation";
import search from "@inquirer/search";
import { listTokens } from "./listTokens";

// Display welcome message
chalkAnimation.rainbow("Welcome to Swap Terminal");

// List of items to search

const main = async () => {
  const tokens = await listTokens();

  // Prompt the user to search the list
  const res = await search({
    message: "Select an token",
    source: async (input, { signal }) => {
      if (!input) {
        return [];
      }

      const response = tokens.filter((t) =>
        t.name.toLowerCase().includes(input.toLowerCase())
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

  console.log("Selected token:", res);
};

main();
