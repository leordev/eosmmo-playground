import * as React from "react";
import { ScatterAccount, trxOpenAccount, loadAccount } from "../api/eos";
import { useFormInput } from "../shared/hooks";
import InputText from "../shared/InputText";

interface ReactProps {
  api: any;
  account: ScatterAccount;
}

const doLoadAccount = async (account: string, setAccountData: any) => {
  const accountData = await loadAccount(account);
  if (accountData) {
    setAccountData(accountData);
  }
};

const AccountSummary = ({ api, account }: ReactProps) => {
  if (!account || !account.name) {
    return <div>Oooppss... Looks like you are not signed in.</div>;
  }

  const [accountData, setAccountData] = React.useState(null as any);
  const playerName = useFormInput("");

  React.useEffect(() => {
    doLoadAccount(account.name, setAccountData);
  }, []);

  const doOpenAccount = async () => {
    if (!playerName.value || playerName.value.length > 20) {
      return alert(
        "You must enter a player name no longer than 20 characters."
      );
    }

    try {
      const trx = await trxOpenAccount(api, account, playerName.value);
      console.info("open account trx", trx);
      setTimeout(() => doLoadAccount(account.name, setAccountData), 1000);
    } catch (e) {
      console.error(e);
      alert("Fail to Open Account");
    }
  };

  return (
    <div>
      <h2>Account Summary</h2>
      {accountData ? (
        <div>
          <strong>Player Name:</strong> {accountData.playername} <br />
          <strong>Experience:</strong> {accountData.experience} <br />
          <strong>Strength:</strong> {accountData.str} <br />
          <strong>Agility:</strong> {accountData.agi} <br />
          <strong>Intelligence:</strong> {accountData.intl} <br />
          <strong>Gold:</strong> {accountData.gold} <br />
        </div>
      ) : (
        <div>
          <p>
            Looks like you have a brand new account, please Create your
            Character below!
          </p>
          <div
            className="has-margin-top has-margin-bottom"
            style={{ maxWidth: 400 }}
          >
            <InputText placeholder="Desired Player Name" {...playerName} />
          </div>
          <button className="button is-success" onClick={doOpenAccount}>
            Open Account
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountSummary;
