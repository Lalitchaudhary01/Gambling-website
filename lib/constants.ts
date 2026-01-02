export const APP_NAME = "Gambling Demo Platform";

export const DEFAULTS = {
  MIN_BET: Number(process.env.DEFAULT_MIN_BET) || 10,
  MAX_BET: Number(process.env.DEFAULT_MAX_BET) || 1000,
  RTP: Number(process.env.DEFAULT_RTP) || 95,
};

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
};

export const BET_STATUS = {
  PENDING: "PENDING",
  WON: "WON",
  LOST: "LOST",
};

export const TXN_TYPE = {
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
};

export const TXN_STATUS = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  PENDING: "PENDING",
};
