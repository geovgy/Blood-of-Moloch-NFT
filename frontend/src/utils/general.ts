/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from "lodash";

export const truncateAddress = (addr: string | undefined): string =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

export const clearNonObjects = (array: any[]): object[] => {
  const noNull = _.filter(array, (x: any) => x !== null);
  const noFalse = _.filter(noNull, (x: any) => x !== false);
  return _.filter(noFalse, (x: any) => x !== undefined);
};

export const displayDate = (date: string) => {
  const options = { year: "numeric", month: "short", day: "2-digit" } as const;
  const today = new Date(date);
  let formattedDate = today.toLocaleDateString("en-US", options);
  if (formattedDate.slice(-4) === "1970") {
    formattedDate = "N/A";
  }
  return formattedDate;
};
