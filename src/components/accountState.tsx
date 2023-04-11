import { useAtom } from "jotai";
import { accountAtom, metamaskProviderAtom } from "../states";
import Button from "@mui/joy/Button";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { loadable } from "jotai/utils";

import * as React from "react";
import PopperUnstyled from "@mui/base/PopperUnstyled";
import ClickAwayListener from "@mui/base/ClickAwayListener";
import { styled } from "@mui/joy/styles";
import MenuList from "@mui/joy/MenuList";
import MenuItem from "@mui/joy/MenuItem";

const loadableMetamaskProviderAtom = loadable(metamaskProviderAtom);

const Popup = styled(PopperUnstyled)({
  zIndex: 1000,
});

export function AccountState() {
  const { t } = useTranslation();
  const [metamaskProvider] = useAtom(loadableMetamaskProviderAtom);
  const [account, setAccount] = useAtom(accountAtom);

  useEffect(() => {
    if (metamaskProvider.state === "hasData") {
      const provider = metamaskProvider.data as {
        on: any;
        removeListener: any;
      };
      const handleAccountsChanged = (accounts: string[]) => {
        setAccount(accounts.length === 0 ? null : accounts[0]);
      };
      provider.on("accountsChanged", handleAccountsChanged);

      return () => {
        provider.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, [metamaskProvider]);

  const isLoading = useMemo(
    () => typeof account !== "string" || metamaskProvider.state === "loading",
    [account, metamaskProvider.state]
  );

  const accountText = useMemo(() => {
    if (isLoading) return t("Wallet Connected");
    if (!account) return "";
    const pre = account.substring(0, 6);
    const hpre = account.substring(account.length - 6, account.length);

    return `${pre}...${hpre}`;
  }, [account, isLoading]);

  return <MenuButton isLoading={isLoading} accountText={accountText} />;
}

function MenuButton({
  isLoading,
  accountText,
}: {
  isLoading: boolean;
  accountText: string;
}) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDisconnect = () => {
    handleClose();
    // reload current page to simulate disconnect.
    window.location.reload();
  };
  const handleListKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    console.error({ event });
    if (event.key === "Tab") {
      setAnchorEl(null);
    } else if (event.key === "Escape") {
      anchorEl?.focus();
      setAnchorEl(null);
    }
  };

  return (
    <div>
      <Button
        id="composition-button"
        aria-controls={open ? "composition-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        loading={isLoading}
        onClick={handleClick}
        sx={(theme) => ({
          marginLeft: theme.spacing(2),
        })}
      >
        {accountText}
      </Button>
      <Popup
        role={undefined}
        id="composition-menu"
        open={open}
        anchorEl={anchorEl}
        disablePortal
        modifiers={[
          {
            name: "offset",
            options: {
              offset: [0, 4],
            },
          },
        ]}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <MenuList
            variant="outlined"
            onKeyDown={handleListKeyDown}
            sx={{ boxShadow: "md", bgcolor: "background.body" }}
          >
            <MenuItem onClick={handleDisconnect}>{t("Log out")}</MenuItem>
          </MenuList>
        </ClickAwayListener>
      </Popup>
    </div>
  );
}
