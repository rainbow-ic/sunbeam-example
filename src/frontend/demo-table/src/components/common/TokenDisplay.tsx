import * as React from "react";
import { Typography } from "@mui/material";

interface TokenUIDisplay {
  name: string;
  avatar: string;
  badge: string;
}

const TokenDisplay = ({ name }: TokenUIDisplay) => {
  return <Typography variant="h6">{name}</Typography>;
};

export default TokenDisplay;
