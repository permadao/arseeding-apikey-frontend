import Container from "@mui/material/Container";
import Typography from "@mui/joy/Typography";
import Skeleton from "@mui/material/Skeleton";
import { ArseedingBundlerStatus } from "./arseedingBundler";
import { Suspense } from "react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Divider from "@mui/joy/Divider";
import Box from "@mui/joy/Box";
import { Button } from "@mui/joy";
import Person3RoundedIcon from "@mui/icons-material/Person3Rounded";
import { OrderKey } from "../types";
import { orderBy } from "lodash";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

const buttons = [
  {
    url: "https://twitter.com/perma_dao",
    title: "PermaDAO",
  },
  {
    url: "https://everpay.io/",
    title: "Everpay",
  },
  {
    url: "https://web3infra.dev/",
    title: "Arseeding",
  },
];
const persons = [
  {
    url: "https://github.com/ethever",
    title: "ethever.eth",
  },
  {
    url: "https://twitter.com/SandyA911",
    title: "Sandy",
  },
  {
    url: "https://twitter.com/sngzwi",
    title: "SONGZIWEI",
  },
  { url: "https://twitter.com/NightowlTina", title: "Tina夜猫猫" },
  { url: undefined, title: "青草原" },
  {
    url: "https://www.xiaohongshu.com/user/profile/555615385894460eb6fd8861",
    title: "腾🌚",
  },
];
const orderKey: OrderKey<typeof buttons> = ["title"];
const orderPat: Array<"desc" | "asc"> = ["asc"];
const Buttons = orderBy(buttons, orderKey, orderPat).map((b) => (
  <LinkButton key={b.url} title={b.title} url={b.url} iconPosition="end" />
));
const Persons = orderBy(persons, orderKey, orderPat).map((b) => (
  <LinkButton key={b.url} title={b.title} url={b.url} iconPosition="start" />
));

export function Footer() {
  return (
    <Container
      maxWidth="lg"
      sx={(theme) => ({
        paddingTop: theme.spacing(5),
        paddingBottom: theme.spacing(3),
      })}
    >
      <Suspense
        fallback={
          <Skeleton>
            <Typography>
              arseeding bundler address:
              uDA8ZblC-lyEFfsYXKewpwaX-kkNDDw8az3IW9bDL68
            </Typography>
          </Skeleton>
        }
      >
        <ArseedingBundlerStatus />
      </Suspense>
      <Divider
        sx={(theme) => ({
          marginTop: theme.spacing(1),
          marginBottom: theme.spacing(3),
          // a: theme.fontSize.
        })}
      />
      <Box>{Buttons}</Box>
      <Typography
        startDecorator={<PeopleAltRoundedIcon fontSize="lg" />}
        sx={(theme) => ({
          color: theme.palette.text.secondary,
          fontSize: theme.fontSize.sm,
          fontWeight: theme.fontWeight.lg,
          padding: theme.spacing(2),
        })}
      >
        Contributors:
      </Typography>
      <Box>{Persons}</Box>
    </Container>
  );
}

function LinkButton({
  url,
  title,
  iconPosition,
}: {
  url: string | undefined;
  title: string;
  iconPosition: "start" | "end";
}) {
  const handleClick = () => {
    if (url) {
      window.open(url);
    }
  };
  if (iconPosition === "start") {
    return (
      <Button
        disabled={!url}
        variant="plain"
        onClick={handleClick}
        startDecorator={<Person3RoundedIcon fontSize="lg" />}
      >
        {title}
      </Button>
    );
  }
  return (
    <Button
      disabled={!url}
      variant="plain"
      onClick={handleClick}
      endDecorator={<OpenInNewIcon fontSize="lg" />}
    >
      {title}
    </Button>
  );
}
