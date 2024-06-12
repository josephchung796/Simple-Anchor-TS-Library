import React, { useState } from "react";
import { Button, FormLabel, Grid, TextField } from "@mui/material";
import {
  useWallet,
  useConnection,
  useAnchorWallet,
  AnchorWallet,
} from "@solana/wallet-adapter-react";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import {
  ConfirmOptions,
  Keypair,
  PublicKey,
  Signer,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import { IDL, SolanaHelloWorld } from "../../contract/types/solana_hello_world";
import idl from "../../contract/idl/solana_hello_world.json";

import "./index.css";

function CreateMessage() {
  const [message, setMessage] = useState<string>("");
  const [result, setResult] = useState<string>("No Result");
  const [messageValue, setMessageValue] = useState<string>("");

  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const programId = new PublicKey(idl.metadata.address);

  const anchorProvider = new AnchorProvider(
    connection,
    wallet as AnchorWallet,
    {
      preflightCommitment: "processed",
    }
  );

  const program = new Program<SolanaHelloWorld>(IDL, programId, anchorProvider);

  const onMessage = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    setMessage(e.currentTarget.value);
  };

  const onCreate = async () => {
    try {
      /* interact with the program via rpc */
      const messageAccount = Keypair.generate();
      const txn = await program.methods
        .createMessage(Number(message))
        .accounts({
          message: messageAccount.publicKey,
          author: publicKey?.toString() as string,
          systemProgram: SystemProgram.programId,
        })
        .signers([messageAccount])
        .rpc();

      setResult(txn);

      const res = await program.account.message.fetch(messageAccount.publicKey);
      setMessageValue(JSON.stringify(res));
      return res;
    } catch (err) {
      console.log("Transaction error: ", err);
      return;
    }
  };

  return (
    <>
      <h2>Create Message Form</h2>
      <Grid justifyContent="center" alignItems="center">
        <Grid>
          <TextField
            variant="outlined"
            label="Message"
            name="message"
            value={message}
            onChange={onMessage}
          />
        </Grid>
        <Grid>
          <Button className="create-btn" onClick={onCreate}>
            Create
          </Button>
        </Grid>
        <Grid>
          <FormLabel>Result:</FormLabel>
          <FormLabel>{result}</FormLabel>
        </Grid>
        <Grid>
          <FormLabel>Message Account:</FormLabel>
          <FormLabel>{messageValue}</FormLabel>
        </Grid>
      </Grid>
    </>
  );
}

export default CreateMessage;
