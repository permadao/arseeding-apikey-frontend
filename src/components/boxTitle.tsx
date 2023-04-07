import Typography from "@mui/joy/Typography";

export function BoxTitle({ title }: { title: string }) {
  return (
    <Typography
      level="h4"
      sx={(theme) => ({
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.xl,
      })}
    >
      {title}
    </Typography>
  );
}
