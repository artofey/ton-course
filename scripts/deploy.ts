import { address, toNano } from "ton-core";
import { compile, NetworkProvider } from "@ton-community/blueprint";
import { MainContract } from "../wrappers/MainContract";

export async function run(provider: NetworkProvider) {
  const myContract = MainContract.createFromConfig(
    {
      number: 0,
      address: address("0QAS76qHG-0PGU4kzbRx3briNUiGCPF9NNXHxEVUpsnX7qe0"),
      owner_address: address(
        "0QAS76qHG-0PGU4kzbRx3briNUiGCPF9NNXHxEVUpsnX7qe0"
      ),
    },
    await compile("MainContract")
  );

  const openedContract = provider.open(myContract)

  openedContract.sendDeploy(provider.sender(), toNano("0.05"));

  await provider.waitForDeploy(myContract.address);
}

// address in testnet
// EQC4aCZ375yRwjh-HsAQV8Qw7qMC6pMP1uyUh2HujFTKrJph
