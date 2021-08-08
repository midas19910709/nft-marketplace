import React, { useContext, useState, useEffect } from 'react';

import web3 from './connection/web3';
import Navbar from './components/Layout/Navbar';
import Main from './components/Content/Main';
import Spinner from './components/Layout/Spinner';
import Web3Context from './store/web3-context';
import CollectionContext from './store/collection-context';
import MarketplaceContext from './store/marketplace-context'
import NFTCollection from './abis/NFTCollection.json';
import NFTMarketplace from './abis/NFTMarketplace.json';


const App = () => {
  const [mktContract, setMktContract] = useState(null);
  
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);
  
  useEffect(() => {
    // Check if the user has Metamask active
    if(!web3) {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
      return;
    }
    
    // Function to fetch all the blockchain data
    const loadBlockchainData = async() => {
      // Request accounts acccess if needed
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });  
      } catch(error) {
        console.error(error);
      }
      
      // Load account
      web3Ctx.loadAccount(web3);

      // Load Network ID
      const networkId = await web3Ctx.loadNetworkId(web3);

      // Load Contracts      
      const nftDeployedNetwork = NFTCollection.networks[networkId];
      const nftContract = collectionCtx.loadContract(web3, NFTCollection, nftDeployedNetwork);

      const mktDeployedNetwork = NFTMarketplace.networks[networkId];
      const mktContract = marketplaceCtx.loadContract(web3, NFTMarketplace, mktDeployedNetwork);

      if(nftContract) {        
        // Load total Supply
        const totalSupply = await collectionCtx.loadTotalSupply(nftContract);
        
        // Load Collection
        collectionCtx.loadCollection(nftContract, totalSupply);       

        // Event subscription 
        
      } else {
        window.alert('NFTCollection contract not deployed to detected network.')
      }

      if(mktContract) {
        // Load whatever is needed from smart contract        
        // Event subscription 
        
      } else {
        window.alert('NFTMarketplace contract not deployed to detected network.')
      }

      if(nftContract && mktContract) {
        // setIsLoading(false);
      }
    };
    
    loadBlockchainData();
    
    // Metamask Event Subscription - Account changed
    window.ethereum.on('accountsChanged', (accounts) => {
      web3Ctx.loadAccount(web3);
    });

    // Metamask Event Subscription - Network changed
    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    });
  }, []);

  const showContent = web3 && collectionCtx.contract && marketplaceCtx.contract && web3Ctx.account;
  
  return(
    <React.Fragment>
      <Navbar />
      {showContent && <Main />}
      {/* {isLoading && <Spinner />} */}
    </React.Fragment>
  );
};

export default App;