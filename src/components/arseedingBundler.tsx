import Box from "@mui/material/Box";
import Typography from "@mui/joy/Typography";
import { useAtom } from "jotai";
import { arseedBundlerAddressAtom } from "../states";

export function ArseedingBundler() {
  const [arseedBundlerAddress] = useAtom(arseedBundlerAddressAtom);
  return (
    <Box>
      <Typography>arseeding bundler address: {arseedBundlerAddress}</Typography>
    </Box>
  );
}
