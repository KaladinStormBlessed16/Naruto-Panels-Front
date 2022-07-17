import "./styles/App.css";
import React, { useEffect, useState } from "react";
import { contractAddresses, abi } from "./constants";
import { ethers } from "ethers";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [mintedText, setMintedText] = useState("");
  const RINKEBY_CHAIN_ID = 4;

  const CONTRACT_ADDRESS =
    RINKEBY_CHAIN_ID in contractAddresses
      ? contractAddresses[RINKEBY_CHAIN_ID][0]
      : null;

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  const requestNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          abi,
          signer
        );
        try {
          setLoading(true);
          let nftTxn = await connectedContract.requestNft();
          await nftTxn.wait(1);

          connectedContract.on("NftMinted", async (tokenId) => {
            setLoading(false);
            setMintedText(
              `You just minted your Naruto Panels NFT, check it out on Opensea! Here's the link: <a href="https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}" target="_blank">Naruto Panel NFT in Testnet Opensea</a>`
            );
          });
        } catch (error) {
          setLoading(false);
          alert(
            "Transaction failed. You can only mint 1 Naruto Panel NFT for each account"
          );
        }
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Naruto Panels NFT</p>
          <p className="sub-text">Get your exclusive Naruto's Manga Panel</p>
          <p className="sub-text-2">
            Only 1 can be minted for account, take yours now for free!
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button
              onClick={requestNft}
              className="cta-button connect-wallet-button mt-5"
            >
              {loading && (
                <span
                  className="spinner-border spinner-border-sm mr-2"
                  role="status"
                  aria-hidden="true"
                ></span>
              )}
              Mint NFT
            </button>
          )}
          {mintedText && mintedText !== "" && (
            <p
              dangerouslySetInnerHTML={{
                __html: mintedText,
              }}
              className="sub-text-2 mt-5"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
