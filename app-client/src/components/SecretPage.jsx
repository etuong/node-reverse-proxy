import React from "react";

const SecretPage = () => {
  return (
    <div className="terminal">
      <h1>Top Secret</h1>

      <p className="output">This is a super secret page!</p>
      <p className="output">
        If you are seeing this, it means you have Admin rights!
      </p>
    </div>
  );
};

export default SecretPage;
