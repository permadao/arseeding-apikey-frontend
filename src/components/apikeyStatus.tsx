import { useState } from "react";
import { statusAtom, getApikeyAtom } from "../states";
import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import { useAtom } from "jotai";
import Box from "@mui/material/Box";

const cardStyle = () => ({
  transition: "transform 0.3s, border 0.3s, box-shadow 0.2s",
  "&:hover": {
    boxShadow: "md",
    transform: "translateY(-2px)",
    borderColor: "neutral.outlinedHoverBorder",
  },
});

export function ApikeyStatus() {
  const [data] = useAtom(statusAtom);
  const [getApikeyFn] = useAtom(getApikeyAtom);
  const [apikey, setApikey] = useState<string | null>(null);
  if (data.error && data.error === "record not found") {
    return (
      <div>
        record not found. topup to register current address of a apikey.
      </div>
    );
  }
  const handleGetApikey = async () => {
    const apikey = await getApikeyFn();
    setApikey(apikey);
  };
  return (
    <Box>
      <Card sx={cardStyle}>
        <Typography level="h3" sx={{ mb: 0.5 }}>
          Apikey Status:
        </Typography>
        <Typography level="body2">
          apikey: {apikey ?? "***************"}
        </Typography>
        <Typography level="body2">estimate cap: {data.estimateCap}</Typography>
        <Typography level="h2" fontSize="sm" sx={{ mb: 0.5 }}>
          token balances in this apikey:
        </Typography>
        <ul>
          {Object.keys(data.tokenBalance).map((o) => (
            <li key={o}>
              {o}: {data.tokenBalance[o]}
            </li>
          ))}
        </ul>
        <Button onClick={handleGetApikey}>get apikey</Button>
      </Card>
    </Box>
  );
}
