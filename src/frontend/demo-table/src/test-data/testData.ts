import { ReactElement } from "react";
import TokenDisplay from "../components/common/TokenDisplay/TokenDisplay";
import { GridColDef } from "@mui/x-data-grid";

// export const columnsData: GridColDef[] = [
//   { field: "id", headerName: "#", width: 70 },
//   {
//     field: "token",
//     headerName: "Token",
//     width: 130,
//     renderCell: (params: TokenUIDisplay) => {
//       return (
//         <TokenDisplay
//           key={params.id}
//           name={params.token}
//           avatar={params.avatar}
//           badge={params.badge}
//         />
//       );
//     },
//   },
//   { field: "buyVol", headerName: "Buy Vol", width: 130 },
//   { field: "sellVol", headerName: "Sell Vol", width: 130 },
//   { field: "netVol", headerName: "Net Vol", width: 130 },
// ];

export interface Token {
  id: number;
  token: string;
  buyVol: string;
  sellVol: string;
  netVol: string;
  avatar: string;
  badge: string;
}

export interface RowDisplay {
  id: number;
  token: {
    name: string;
    avatar: string;
    badge: string;
  };
  buyVol: string;
  sellVol: string;
  netVol: string;
}

export const rowData: Token[] = [
  {
    id: 1,
    token: "Farm",
    buyVol: "618.7K",
    sellVol: "368.3K",
    netVol: "250.4K",
    avatar: "token1",
    badge: "ether",
  },
  {
    id: 2,
    token: "Vista",
    buyVol: "535.3K",
    sellVol: "428.3K",
    netVol: "234.4K",
    avatar: "token2",
    badge: "ether",
  },
  {
    id: 3,
    token: "RLB",
    buyVol: "97.4K",
    sellVol: "26.9K",
    netVol: "70.5K",
    avatar: "token3",
    badge: "ether",
  },
  {
    id: 4,
    token: "E",
    buyVol: "282.2K",
    sellVol: "213.3K",
    netVol: "69.9K",
    avatar: "token4",
    badge: "ether",
  },
  {
    id: 5,
    token: "Mog",
    buyVol: "78.2K",
    sellVol: "8.7K",
    netVol: "69.5K",
    avatar: "token5",
    badge: "ether",
  },
  {
    id: 6,
    token: "UNI",
    buyVol: "65.5K",
    sellVol: "2.9K",
    netVol: "62.6K",
    avatar: "token6",
    badge: "ether",
  },
  {
    id: 7,
    token: "SHFL",
    buyVol: "47.3K",
    sellVol: "0K",
    netVol: "47.3K",
    avatar: "token7",
    badge: "ether",
  },
];
