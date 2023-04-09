import { useAtom } from "jotai";

import { useMemo, useState } from "react";
import Table from "@mui/joy/Table";
import { Box, IconButton, Typography } from "@mui/joy";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { ethers } from "ethers";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { historiesAtom } from "../states";

export function TransactionHistories() {
  const { t } = useTranslation();
  const [pageIndex, setPageIndex] = useState(0);
  const [histories, dispatch] = useAtom(historiesAtom);

  const fetchNextPage = () => dispatch({ type: "fetchNextPage" });
  // https://scan.everpay.io/tx/0xab2f787d06041582bd984b549c885dac50cae22599e254141857f506206027ba

  const handleFetchNextPage = async () => {
    await fetchNextPage();
    // TODO: need refactor here.
    const index = pageIndex + 1;
    const t = histories.pages.length - 1;
    if (index >= t) {
      setPageIndex(t);
      return;
    }
    setPageIndex(pageIndex + 1);
  };
  const handleFetchPreviousPage = async () => {
    if (pageIndex <= 0) {
      setPageIndex(0);
      return;
    }
    setPageIndex(pageIndex - 1);
  };

  const items = useMemo(() => {
    if (histories.pages.length >= 1) {
      const firstPage = histories.pages[pageIndex];
      return firstPage.map((t) => {
        const handleClick = () => {
          const url = `https://scan.everpay.io/tx/${t.everHash}`;
          window.open(url);
        };
        return (
          <tr key={t.rawId} onClick={handleClick}>
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
    }
  }, [histories.pages, pageIndex]);

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
