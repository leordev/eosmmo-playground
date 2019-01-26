import * as React from "react";

const AuthSession = ({
  match: {
    params: { sessionId }
  }
}: any) => <div>Login Session: {sessionId}</div>;

export default AuthSession;
