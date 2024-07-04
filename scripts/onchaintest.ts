import { Address, Cell, contractAddress, toNano, TonClient4 } from "ton";
import { hex } from "../build/main.compiled.json";
import { getHttpV4Endpoint } from "@orbs-network/ton-access";
import qs from "qs";
import qrcode from "qrcode-terminal";

async function onchainTestScript() {
  const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
  const dataCell = new Cell();

  const address = contractAddress(0, {
    code: codeCell,
    data: dataCell,
  });

  console.log("address", address);

  const endpoint = await getHttpV4Endpoint({
    network: "testnet",
  });
  const client4 = new TonClient4({ endpoint });

  const latestBlock = await client4.getLastBlock();
  let status = await client4.getAccount(latestBlock.last.seqno, address);

  if (status.account.state.type !== "active") {
    console.log("Contract is not active");
    return;
  }
  console.log("Successfully");

  let link =
    `https://tonhub.com/transfer/` +
    address.toString({ testOnly: true }) +
    "?" +
    qs.stringify({
      text: "Simple test Artem1 transaction",
      amount: toNano(1).toString(10),
    });

  console.log("URL: ", link);
  qrcode.generate(link, { small: true }, (code) => {
    console.log(code);
  });

  let recent_sender_archive: Address;

  setInterval(async () => {
    const latestBlock = await client4.getLastBlock();
    const { exitCode, result } = await client4.runMethod(
      latestBlock.last.seqno,
      address,
      "get_the_latest_sender"
    );
    console.log("Lseq", latestBlock.last.seqno)

    if (exitCode !== 0) {
      console.error("Running getter method failed", exitCode);
      return;
    }

    if (result[0].type !== "slice") {
      console.warn("Unknow result type");
      return;
    }

    let most_recent_sender = result[0].cell.beginParse().loadAddress();

    if (
      recent_sender_archive &&
      most_recent_sender.toString() !== recent_sender_archive?.toString()
    ) {
      console.warn(
        "New recent sender fount: " +
          most_recent_sender.toString({ testOnly: true })
      );
      recent_sender_archive = most_recent_sender;
    } else {
      console.log("Current recent sender is: ", most_recent_sender.toString({testOnly: true }));
    }
  }, 2000);
}

onchainTestScript();
