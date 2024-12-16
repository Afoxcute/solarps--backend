const dotenv = require("dotenv");
dotenv.config()
const bs58 = require('bs58')
const History = require('../../db/history.model')

const web3 = require("@solana/web3.js");



exports.getHistory = async (req, res) => {
  console.log("getHistory log - 1 : ", req.body);
  try {

    const getTop10Result = await History.find({}).sort({ _id: -1 }).limit(5);
    console.log("getHistory log - 2 : ", getTop10Result);
    return res.send({ result: true, data: getTop10Result });
  } catch (error) {
    console.log(error)
    return res.send({
      result: false,
      error: "Error detected in server progress!",
    });
  }
};

exports.getHistoryByAccount = async (req, res) => {
  try {
    const result = await History.findOne(
      { accountId: req.body.accountId }
    ).sort({ _id: -1 });
    return res.send({ result: true, data: result });
  } catch (error) {
    return res.send({
      result: false,
      error: "Error detected in server progress!",
    });
  }
};

exports.setHistory = async (req, res) => {

  try {
    console.log("sendOffer log - 1 : ", req.body);
    const { walletAddress, betType, betAmount, win, tx } = req.body
    let winfin;
    if (win == 0) {
      winfin = 1
    } else {
      winfin = 0
    }
    const createResult = await History.create({
      accountId: walletAddress,
      betType: betType,
      betAmount: betAmount,
      win: winfin,
      tx: tx,
    });
    const newAmount = betAmount * 2
    console.log("updateHistory log - 3 : ", createResult);

    console.log(process.env.PRIVATE_KEY)
    if (winfin === 1) {

      const key = bs58.decode(process.env.PRIVATE_KEY);

      console.log(key, process.env.PRIVATE_KEY)
      const from = web3.Keypair.fromSecretKey(key);
      const connection = new web3.Connection(web3.clusterApiUrl(process.env.NETWORK_TYPE));
      const to = new web3.PublicKey(walletAddress);
      const amount = web3.LAMPORTS_PER_SOL * newAmount;

      const transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
          fromPubkey: from.publicKey,
          toPubkey: to,
          lamports: amount,
        })
      );

      const txid = await web3.sendAndConfirmTransaction(connection, transaction, [from]);
      console.log("Transaction successful!" + txid);


    }



    if (!createResult) {
      return res.send({ result: false });
    } else {
      return res.send({ result: true, data: 'data updated' });
    }
  } catch (error) {
    console.log(error)
    return res.send({ result: false, error: error })
  }
};

exports.getGameStatus = async (req, res) => {
  try {
    // get treasury balance
    const address = new web3.PublicKey(process.env.TREASURY_ADDRESS);
    const connection = new web3.Connection(web3.clusterApiUrl(process.env.NETWORK_TYPE));

    const balance = await connection.getBalance(address);
    console.log("getGameStatus log - 0 : ", balance / web3.LAMPORTS_PER_SOL);

    // get total player count
    const players = await History.distinct("accountId");
    console.log("getGameStatus log - 1 : ", players.length);

    // get total volume
    const volume = await History.aggregate([
      { $group: { _id: null, totalVolume: { $sum: "$betAmount" } } },
    ]);
    console.log(
      "getGameStatus log - 2 : ",
      parseFloat(volume[0].totalVolume).toFixed(2)
    );

    // get rps selected rate
    const rockCount = await History.countDocuments({ betType: "rock" });
    const paperCount = await History.countDocuments({ betType: "paper" });
    const scissorsCount = await History.countDocuments({ betType: "scissors" });

    const totalCount = rockCount + paperCount + scissorsCount;
    const rateInfo = [];
    rateInfo.push(parseInt((rockCount * 100) / totalCount));
    rateInfo.push(parseInt((paperCount * 100) / totalCount));
    rateInfo.push(parseInt((scissorsCount * 100) / totalCount));
    console.log("getGameStatus log - 3 : ", rateInfo);

    // get play count
    const playCount = [];
    for (let i = 0; i < 10; i++) {
      const today = new Date();
      const startDay = new Date(today);
      startDay.setDate(today.getDate() - (i + 1));
      const endDay = new Date(today);
      endDay.setDate(today.getDate() - i);

      const dayInfo = await History.find({
        createdAt: {
          $gte: startDay,
          $lt: endDay,
        },
      });
      playCount.push(dayInfo.length);
    }

    console.log("getGameStatus log - 4 : ", playCount);

    return res.send({
      result: true,
      data: {
        treasuryBalance: balance / web3.LAMPORTS_PER_SOL,
        totalPlayerCount: players.length,
        totalVolume: parseFloat(volume[0].totalVolume).toFixed(2),
        rpsRate: rateInfo,
        playCount: playCount,
      },
    });
  } catch (error) {
    console.log(error);
    return res.send({
      result: false,
      error: "Error detected in server progress!",
    });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    let userInfo = [];
    const players = await History.distinct("accountId");
    console.log("getUserInfo log - 1 : ", players);

    for (let i = 1; i < players.length; i++) {
      // get total volume
      const volume = await History.aggregate([
        { $match: { accountId: players[i] } },
        { $group: { _id: "$accountId", totalVolume: { $sum: "$betAmount" } } },
      ]);
      console.log(
        "getGameStatus log - 2 : ",
        parseFloat(volume[0].totalVolume).toFixed(2)
      );

      // get play count
      const playCount = await History.countDocuments({ accountId: players[i] });
      console.log("getGameStatus log - 3 : ", playCount);

      // get win count
      const winCount = await History.countDocuments({
        accountId: players[i],
        win: 1,
      });
      console.log("getGameStatus log - 3.1 : ", winCount);

      // get lose count
      const loseCount = await History.countDocuments({
        accountId: players[i],
        win: 0,
      });
      console.log("getGameStatus log - 3.2 : ", loseCount);

      // get average bet
      const averageBet = await History.aggregate([
        { $match: { accountId: players[i] } },
        { $group: { _id: null, avgBetAmount: { $avg: "$betAmount" } } },
      ]);
      console.log(
        "getGameStatus log - 4 : ",
        parseFloat(averageBet[0].avgBetAmount).toFixed(2)
      );

      // get last played time
      const lastplay = await History.findOne({ accountId: players[i] }).sort({
        createdAt: -1,
      });

      console.log("getGameStatus log - 5 : ", Date.now() - lastplay.createdAt);

      userInfo.push({
        address: players[i],
        volume: parseFloat(volume[0].totalVolume).toFixed(2),
        playCount: playCount,
        betAverage: parseFloat(averageBet[0].avgBetAmount).toFixed(2),
        winRate: parseFloat((winCount * 100) / playCount).toFixed(2),
        loseRate: parseFloat((loseCount * 100) / playCount).toFixed(2),
        lastPlayed: Date.now() - lastplay.createdAt,
      });
    }
    return res.send({
      result: true,
      data: userInfo,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      result: false,
      error: "Error detected in server progress!",
    });
  }
};
