import BigNumber from 'bignumber.js'
import { Finding, TransactionEvent, FindingSeverity, FindingType, getEthersProvider, ethers } from 'forta-agent'

import {FLEXA_COLLATERAL_MANAGER_ADDRESS,SUPPLY_RECEIPT_EVENT,AMP_TOKEN_ADDRESS,AMP_TOKEN_ABI} from './constants';

const ethersProvider = getEthersProvider()
const ampTokenContract = new ethers.Contract(AMP_TOKEN_ADDRESS, AMP_TOKEN_ABI, ethersProvider)

async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = []
    //Fetching arguments value of supply receipt event from collateral manager contract
    const [supplyReceiptEvent] = txEvent.filterLog(SUPPLY_RECEIPT_EVENT, FLEXA_COLLATERAL_MANAGER_ADDRESS);

    const partition=supplyReceiptEvent.args.partition;
    const amount =new BigNumber(supplyReceiptEvent.args.amount.toString().dividedBy(10 ** 18));

    //fetching totalSupplyByPartition mapping value from AMP Token contract
    const blockNumber = txEvent.blockNumber
    const amountThreshold = await ampTokenContract.totalSupplyByPartition(partition, { blockTag: blockNumber })

    
    if (amount.isLessThan(amountThreshold)) return;

    findings.push(
        Finding.fromObject({
          name: "Large Deposits",
          description: "Large Deposits into staking pool",
          alertId: "",
          protocol:"flexa",
          type: FindingType.Info,
          severity: FindingSeverity.Info,
          metadata: {
           
          },
        })
      );
      return findings;

}
module.exports = {
    handleTransaction
  };
