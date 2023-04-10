import Box from "@mui/material/Box";
import Typography from "@mui/joy/Typography";
import { useAtom } from "jotai";
import { arseedingBundlerAddressAtom } from "../states";

export function ArseedingBundlerStatus() {
  const [arseedingBundlerAddress] = useAtom(arseedingBundlerAddressAtom);
  return (
    <Box>
      <Typography
        fontSize="sm"
        sx={(theme) => ({
          color: theme.palette.text.secondary,
        })}
      >
        arseeding bundler address: {arseedingBundlerAddress}
      </Typography>
    </Box>
  );
}
