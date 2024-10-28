// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const safeParseJSON = (arg: Record<string, unknown>): any => {
  return JSON.stringify(
    arg,
    (_key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
  );
};
