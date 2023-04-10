import { useAtom } from "jotai";

import { useEffect, useMemo, useState } from "react";
import Table from "@mui/joy/Table";
import { Box, IconButton, Typography } from "@mui/joy";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { ethers } from "ethers";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { historiesAtom } from "../states";
import CircularProgress from "@mui/joy/CircularProgress";

export function TransactionHistories({
  setHasPage,
}: {
  setHasPage: (expand: boolean) => void;
}) {
  const { t } = useTranslation();
  const [pageIndex, setPageIndex] = useState(0);
  const [histories, dispatch] = useAtom(historiesAtom);

  const hasPage = useMemo(
    () => !(histories.pages.length === 1 && histories.pages[0].length === 0),
    [histories]
  );

  useEffect(() => setHasPage(hasPage), [histories.pages]);

  const fetchNextPage = () => dispatch({ type: "fetchNextPage" });

  const handleFetchNextPage = async () => {
    const index = pageIndex + 1;
    const t = histories.pages.length;
    setPageIndex(index > t ? t - 1 : index);
    await fetchNextPage();
  };
  const handleFetchPreviousPage = async () => {
    const newIndex = pageIndex - 1;
    setPageIndex(newIndex <= 0 ? 0 : newIndex);
  };

  const items = useMemo(() => {
    const currentPage = histories.pages[pageIndex];
    if (currentPage) {
      return currentPage.map((t) => {
        const handleOpenTransaction = (everHash: string) => {
          const url = `https://scan.everpay.io/tx/${everHash}`;
          window.open(url);
        };
        return (
          <tr
            style={{ cursor: "pointer" }}
            key={t.rawId}
            onClick={() => handleOpenTransaction(t.everHash)}
          >
            <td>{t.rawId}</td>
            <td>{t.symbol}</td>
            <td>{ethers.utils.formatUnits(t.amount, t.decimals)}</td>
            <td>
              <Typography noWrap>{t.everHash}</Typography>
            </td>
            <td>{dayjs(t.timestamp).fromNow(true)} ago</td>
          </tr>
        );
      });
    } else {
      return (
        <Box
          sx={{
            width: "100%",
            display: "grid",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
  }, [histories, pageIndex]);

  if (!hasPage) {
    return (
      <Box
        sx={{
          display: "grid",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Typography>{t("No more history item.")}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Table
        aria-label="transaction histories table"
        stickyHeader
        stripe="odd"
        hoverRow
        sx={{
          overflow: "scroll",
        }}
      >
        <thead>
          <tr>
            <th>{t("rawId")}</th>
            <th>{t("token")}</th>
            <th>{t("amount")}</th>
            <th>{t("everHash")}</th>
            <th>{t("timestamp")}</th>
          </tr>
        </thead>
        <tbody>{items}</tbody>
      </Table>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <IconButton variant="plain" onClick={handleFetchPreviousPage}>
          <KeyboardArrowLeftIcon />
        </IconButton>
        <IconButton
          variant="plain"
          sx={(theme) => ({ marginLeft: theme.spacing(1) })}
          onClick={handleFetchNextPage}
        >
          <KeyboardArrowRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
