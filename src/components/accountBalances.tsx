import { useAtom } from "jotai";
import { accountAtom, notZeroBalancesAtom } from "../states";
import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";

export function AccountBalances() {
  const [account] = useAtom(accountAtom);
  const [balances] = useAtom(notZeroBalancesAtom);
  return (
    <Box>
      <Typography level="body2">account address: {account}</Typography>
      <Typography>balances in everpay:</Typography>
      <ul>
        {balances.map((b) => (
          <li key={b.tag}>
            {b.symbol}: {b.balance}
          </li>
        ))}
      </ul>
    </Box>
  );
}
