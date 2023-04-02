import Box from "@mui/material/Box";
import Typography from "@mui/joy/Typography";
import { useAtom } from "jotai";
import { arseedingBundlerAddressAtom } from "../states";

export function ArseedingBundler() {
  const [arseedingBundlerAddress] = useAtom(arseedingBundlerAddressAtom);
  return (
    <Box>
      <Typography>
        arseeding bundler address: {arseedingBundlerAddress}
      </Typography>
    </Box>
  );
}
