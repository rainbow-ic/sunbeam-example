import * as React from "react";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { Token } from "@alpaca-icp/token-adapter";
import { HttpAgent } from "@dfinity/agent";

interface TokenUIDisplay {
  address: string;
}

const TokenLogo = ({ address }: TokenUIDisplay) => {
  const [imageUrl, setImageUrl] = React.useState<string>("");
  React.useEffect(() => {
    const fetchImage = async () => {
      try {
        const token = new Token({
          canisterId: address,
          agent: HttpAgent.createSync({
            host: "https://ic0.app",
          }),
          tokenStandard: "ICRC1",
        });
        const logo = await token.getLogo();
        setImageUrl(logo);
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchImage();
  }, [address]);
  return (
    <Stack direction="row" spacing={2}>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Avatar alt="Travis Howard" src={imageUrl} />
      </Badge>
    </Stack>
  );
};

export default TokenLogo;
