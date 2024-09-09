import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { rowData, RowDisplay, Token } from "../../test-data/testData";
import TokenDisplay from "../common/TokenDisplay";
import { HttpAgent } from "@dfinity/agent";
import { DexFactory, SupportedDEX } from "@rainbow-ic/sunbeam";
import { Typography } from "@mui/material";
import { PublicTokenOverview } from "@rainbow-ic/sunbeam/src/types/actors/icswap/icpswapNodeIndex";
import TokenLogo from "../common/TokenLogo";

const paginationModel = { page: 0, pageSize: 20 };

const columnsData: GridColDef[] = [
  { field: "id", headerName: "#", width: 70 },
  {
    field: "address",
    headerName: "Logo",
    width: 200,
    renderCell: (params) => {
      return <TokenLogo address={params.value} />;
    },
  },
  {
    field: "name",
    headerName: "name",
    width: 200,
    renderCell: (params) => {
      return <TokenDisplay name={params.value} avatar={""} badge={""} />;
    },
  },
  { field: "feesUSD", headerName: "feesUSD", width: 130 },
  { field: "priceUSD", headerName: "priceUSD", width: 130 },
  { field: "priceUSDChange", headerName: "priceUSDChange", width: 130 },
  { field: "standard", headerName: "standard", width: 130 },
  { field: "symbol", headerName: "symbol", width: 130 },
  { field: "totalVolumeUSD", headerName: "totalVolumeUSD", width: 130 },
  { field: "volumeUSD", headerName: "volumeUSD", width: 130 },
  { field: "volumeUSD1d", headerName: "volumeUSD1d", width: 130 },
  { field: "volumeUSD7d", headerName: "volumeUSD7d", width: 130 },
];

export const listTokens = async () => {
  const agent = new HttpAgent({ host: "https://ic0.app" });

  const icpswap = await DexFactory.create({
    dex: SupportedDEX.ICPSwap,
    initArgs: {
      agent,
    },
  });

  const tokens = await icpswap.listTokens();

  return tokens;
};

const DataTable = () => {
  const [dataGridRows, setDataGridRows] = useState<RowDisplay[]>([]);
  const [tokens, setTokens] = useState<PublicTokenOverview[]>([]);

  useEffect(() => {
    rowData.forEach((r: Token) => {
      const item: RowDisplay = {
        id: r.id,
        buyVol: "$" + r.buyVol,
        sellVol: "$" + r.sellVol,
        netVol: "$" + r.netVol,
        token: {
          name: r.token,
          avatar: "../../../images/" + r.avatar + ".jpg",
          badge: "../../../images/" + r.badge + ".jpg",
        },
      };
      setDataGridRows((prevRows) => [...prevRows, item]);
    });
  }, []);

  useEffect(() => {
    const fetchTokens = async () => {
      const result: PublicTokenOverview[] = await listTokens();
      result.forEach((t, ind) => {
        t.id = BigInt(ind);
      });
      console.log(result);
      setTokens(result);
    };

    fetchTokens();
  }, []);

  return (
    <Paper sx={{ height: 700, width: "100%" }}>
      <DataGrid
        rows={tokens.length > 0 ? tokens : []}
        columns={columnsData}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[20, 50, 100]}
        sx={{ border: 0 }}
      />
      <Typography></Typography>
    </Paper>
  );
};

export default DataTable;
