import * as React from "react";
import { ScatterAccount, trxLogin } from "../api/eos";

interface ReactProps {
  match: any;
  api: any;
  account: ScatterAccount;
}

const AuthSession = ({
  match: {
    params: { sessionId }
  },
  api,
  account
}: ReactProps) => {
  if (!sessionId) {
    return <p>Invalid Game Session</p>;
  }

  const [isValidated, setValidated] = React.useState(false);

  const doLogin = async () => {
    try {
      await trxLogin(api, account, sessionId);
      setValidated(true);
    } catch (e) {
      console.error("Fail to validate game session", e);
      alert("Fail to validate game session");
    }
  };

  if (!account) {
    return <p>Please sign in to be able to enter in your game session!</p>;
  }

  return isValidated ? (
    <p>Your game session is valid, please go back to your game!</p>
  ) : (
    <button className="button is-success" onClick={doLogin}>
      Validate Game Session
    </button>
  );
};

export default AuthSession;
