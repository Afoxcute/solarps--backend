const dotenv = require("dotenv");
const fs = require('fs')
const web3js = require("@solana/web3.js");
const History = require('./src/db/history.model')
const mongoose = require('mongoose')

// mongoose
//     .connect('mongodb://127.0.0.1:27017/solana_coinflip', {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     })
//     .then(() => {
//         console.log('Connect');
//     })
//     .catch(err => {
//         console.log('fail', err);
//         process.exit();
//     });

const work = async () => {
    // Getting testnet solana
    const address = new web3js.PublicKey('74CzVXCXq1ydeS3HYA8NU9BM86nkBm66qG9sGJamagUH');
    const connection = new web3js.Connection(web3js.clusterApiUrl(process.env.NETWORK_TYPE));
    let airdropSignature = await connection.requestAirdrop(
        address,
        web3js.LAMPORTS_PER_SOL,
    );

    await connection.confirmTransaction({ signature: airdropSignature });

    const balance = await connection.getBalance(address);
    console.log(address)
    console.log("getGameStatus log - 0 : ", balance / web3js.LAMPORTS_PER_SOL);
}



const dos = async () => {
    const data = fs.readFileSync('./db.json')
    const fin = JSON.parse(data)

    const createResult = fin.map(async (el) => {
        console.log(el.win)
        const pls = await History.findOneAndUpdate({ accountId: el.accountId }, {
            accountId: el.accountId,
            betType: el.betType,
            betAmount: el.betAmount,
            win: el.win,
            tx: el.tx,
        }, { upsert: true });
        return pls
    })

    console.log("updateHistory log - 3 : ", createResult);
}
// const wo = async () => {
//     const res = await fetch('http://3.83.135.177:5438/')
//     console.log(res.data)
// }
work()