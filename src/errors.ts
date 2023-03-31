export const BaseError = class extends Error {
  constructor(message: string) {
    super(message);
  }
};

export const AmountInvalidError = class extends BaseError {};
export const TagCannotBeNullError = class extends BaseError {};
export const CannotFindMetamaskWalletError = class extends BaseError {};
