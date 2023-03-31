import { useAtom } from "jotai";
import { accountAtom, balancesAtom } from "../states";
import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";

export function AccountBalances() {
  const [account] = useAtom(accountAtom);
  const [balances] = useAtom(balancesAtom);
  return (
    <Box>
      <Typography level="body2">
        balances of current account({account}) in everpay:
      </Typography>
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
