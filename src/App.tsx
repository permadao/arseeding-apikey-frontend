import { Suspense, useEffect, useState } from "react";
import {
  accountsAtom,
  arseedBundlerAddressAtom,
  arseedingBundlerAddressAtom,
  balancesAtom,
  everpayAtom,
  getApikeyAtom,
  metamaskProviderAtom,
  statusAtom,
} from "./states";
import { useAtom, Provider } from "jotai";

const sleep = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

function CurrentAddressContainer() {
  const [accounts, setAccounts] = useAtom(accountsAtom);
  const [metamaskProvider] = useAtom(metamaskProviderAtom);

  const handleGetAccounts = async () => {
    const accounts = await metamaskProvider.request!({
      method: "eth_requestAccounts",
    });
    setAccounts(accounts);
  };
  return (
    <div>
      {accounts.length !== 0 && <p>current account: {accounts[0]}</p>}
      {accounts.length === 0 && (
        <button onClick={handleGetAccounts}>connect wallet</button>
      )}
    </div>
  );
}

function Status() {
  const [data] = useAtom(statusAtom);
  const [getApikeyFn] = useAtom(getApikeyAtom);

  if (data.error) {
    return <div>error</div>;
  }
  const handleGetApikey = async () => {
    const apikey = await getApikeyFn();

    console.error({ apikey });
  };
  // sig: 0xd7b0beb157a9540db245312fa8619c25a54bee39fe66ab8254f04fadb942f2db1c9b3a48857f147e69190ea67ba2c8286b63c75f1c97e357d1eb568132fcd0141c
  // account: 0x0de2fe0fbe524fa2adc0ecb004a766e6ea46e0d7
  return (
    <div>
      <h1>Status:</h1>
      <p>estimateCap: {data.estimateCap}</p>
      <h2>tokenBalance:</h2>
      <ul>
        {Object.keys(data.tokenBalance).map((o) => (
          <li key={o}>
            {o}: {data.tokenBalance[o]}
          </li>
        ))}
      </ul>
      <button onClick={handleGetApikey}>get apikey</button>
    </div>
  );
}

function CurrentAccountBalances() {
  const [balances] = useAtom(balancesAtom);
  return (
    <div>
      <ul>
        {balances.map((b) => (
          <li key={b.tag}>
            {b.symbol}: {b.balance}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArseedingBundler() {
  const [arseedBundlerAddress] = useAtom(arseedBundlerAddressAtom);
  return <div>arseeding bundler address: {arseedBundlerAddress}</div>;
}
function Topup() {
  const [arseedingBundlerAddress] = useAtom(arseedingBundlerAddressAtom);
  const [hash, setHash] = useState<string | null>();
  const [everpay] = useAtom(everpayAtom);

  const handleTopup = async () => {
    const res = await everpay.transfer({
      tag: "ethereum-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      amount: "0.001",
      to: arseedingBundlerAddress,
      data: { appName: "arseeding", action: "apikeyPayment" },
    });
    setHash(res.everHash);
  };
  return (
    <div>
      <h2>Topup to arseeding</h2>
      <p>topup transaction hash: {hash}</p>
      <button onClick={handleTopup}>topup</button>
    </div>
  );
}

function App() {
  return (
    <Provider>
      <Suspense fallback="loading arseeding bundler address">
        <ArseedingBundler />
      </Suspense>
      <Suspense fallback="loading balances of current account">
        <CurrentAccountBalances />
      </Suspense>
      <Suspense fallback={"loading current address container..."}>
        <CurrentAddressContainer />
      </Suspense>
      <Suspense fallback="loading status...">
        <Status />
      </Suspense>
      <Suspense fallback="loading topup component...">
        <Topup />
      </Suspense>
    </Provider>
  );
}

export default App;
