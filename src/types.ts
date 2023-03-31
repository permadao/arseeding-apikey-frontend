declare module "@mui/joy/styles" {
  interface TypographySystemOverrides {
    h5: false;
    h6: false;
    body4: false;
    body5: false;
  }
}
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
export type OrderKey<T extends readonly unknown[]> = Array<
  keyof ArrayElement<T>
>;
