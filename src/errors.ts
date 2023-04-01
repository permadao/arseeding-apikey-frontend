export const BaseError = class extends Error {
  constructor(message: string) {
    super(message);
  }
};

export const AmountInvalidError = class extends BaseError {};
export const TagCannotBeNullError = class extends BaseError {};
export const CannotFindMetamaskWalletError = class extends BaseError {};
export const CurrencyOrSizeInvalidError = class extends BaseError {};
export const QueryKeyLengthError = class extends BaseError {};
export const AcountNotFoundError = class extends BaseError {};
