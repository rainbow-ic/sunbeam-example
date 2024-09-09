import "./App.css";
import DataTable from "./components/DataTable/DataTable";
import { Typography } from "@mui/material";
function App() {
  return (
    <>
      <Typography variant="h3" align="center">
        Token List
      </Typography>
      <DataTable />
    </>
  );
}

export default App;
