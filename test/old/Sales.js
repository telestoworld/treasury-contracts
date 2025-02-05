// const chai = require('chai')
//     .use(require('chai-as-promised'))
// const expect = chai.expect;
// const { ethers } = require("hardhat");
// // const { solidity } = require("ethereum-waffle");

// const { toNumber, sampleSize } = require("lodash");


// describe('Sales Contract', (async) => {

//     let Sale, sale,UniswapV2Factory, uniswapV2Factory,OlyToken, olytoken, CUSD, cUsd, olyInBytes32, cUsdInBytes32, pairAddress, token0Amount, token1Amount, yy, mockDAO, mockStakingDistr;

//     beforeEach(async () => {

//         [owner, addr1, tokenA, tokenB, treasury, gov] = await ethers.getSigners();

//         UniswapV2Factory = await ethers.getContractFactory('UniswapV2Factory');
//         uniswapV2Factory = await UniswapV2Factory.deploy(addr1.address);

//         Sale = await ethers.getContractFactory('Sales');
//         sale = await Sale.deploy();

//         OlyToken = await ethers.getContractFactory('TestToken2Old');
//         olytoken = await OlyToken.deploy();

//         CUSD = await ethers.getContractFactory('TestToken1Old');
//         cUsd = await CUSD.deploy();

//         await uniswapV2Factory.createPair(olytoken.address, cUsd.address);
//         pairAddress = await uniswapV2Factory.getPair(olytoken.address, cUsd.address);

//         await sale.setDaiAddr(cUsd.address);
//         await sale.setOlyAddr(olytoken.address);
//         await sale.setUniswapFactoryAddress(uniswapV2Factory.address);
//         await sale.setUniswapV2PairAddress(pairAddress);
//         await sale.setTreasuryAddress(treasury.address);
//         await sale.setGovAddress(gov.address);

//         token0Amount ='10000000000000000000000';
//         token1Amount ='10000000000000000000000';
//         await olytoken.transfer(pairAddress, token0Amount);
//         await cUsd.transfer(pairAddress, token1Amount);
//         await sale.mint(owner.address); 

//         olyInBytes32 = '0x6f6c790000000000000000000000000000000000000000000000000000000000';
//         cUsdInBytes32 = '0x6461690000000000000000000000000000000000000000000000000000000000'; 

//     })
    
//     describe('updateTokenToSellForTheNext8Hrs()', () => {
//         it('should fail if address is not treasury', async () => {
//             const amountToSell = '1000000000000000000';
//             const indicator = 0;
//             await expect(sale.connect(addr1).updateNext8Hrs(amountToSell,indicator))
//             .to.be.rejectedWith( "revert only treasury contract address can call function");
//         });

//         it('should pass if address is treasury,totalOlyToken & totalCUSDToken are update based on indicator value ', async () => {
//             const indicatorA = 0;
//             const indicatorB = 1;
//             const amountToSell = '1000000000000000000';
//             await olytoken.mint(sale.address, amountToSell);
//             await sale.connect(treasury).updateNext8Hrs(amountToSell,indicatorA);
//             expect(BigInt(await sale.totalOlyTokenToSellForTheNext8Hrs()).toString()).to.equal(amountToSell);
//             await sale.connect(treasury).updateNext8Hrs(amountToSell,indicatorB);
//             expect(BigInt(await sale.totalCUSDTokenToSellForTheNext8Hrs()).toString()).to.equal(amountToSell);
//         })

//         it('should burn left OLY from lastEpoch when indicator = 1 i.e sales receives CUSD, returns totalOlyToken as 0', async () => {
//             const indicatorA = 0;
//             const indicatorB = 1;
//             const amountToSell = '1000000000000000000';
//             await olytoken.mint(sale.address, amountToSell);
//             expect(BigInt(await olytoken.balanceOf(sale.address)).toString()).to.equal(amountToSell);
//             await sale.connect(treasury).updateNext8Hrs(amountToSell,indicatorA);
//             expect(BigInt(await sale.totalOlyTokenToSellForTheNext8Hrs()).toString()).to.equal(amountToSell);
//             await sale.connect(treasury).updateNext8Hrs(amountToSell,indicatorB);
//             expect(BigInt(await olytoken.balanceOf(sale.address)).toString()).to.equal('0');
//             expect(BigInt(await sale.totalOlyTokenToSellForTheNext8Hrs()).toString()).to.equal('0');
//         })

//         it('should transfer left CUSD from lastEpoch to treasury when indicator = 0 i.e sales receives OLY, returns totalCUSDToken as 0', async () => {
//             const indicatorA = 0;
//             const indicatorB = 1;
//             const amountToSell = '1000000000000000000';
//             await cUsd.mint(sale.address, amountToSell);
//             await sale.connect(treasury).updateNext8Hrs(amountToSell,indicatorB);
//             await sale.connect(treasury).updateNext8Hrs(amountToSell,indicatorA);
//             expect(BigInt(await cUsd.balanceOf(treasury.address)).toString()).to.equal(amountToSell);
//             expect(BigInt(await sale.totalCUSDTokenToSellForTheNext8Hrs()).toString()).to.equal('0');
//         })
//     })
    
      
//     describe('Swap()', async () => {
//         let amountToSell, amountToGet, marketPrice;
//         beforeEach(async () => {
            
//              amountToSell = '100000000000000000000';
            
//             await cUsd.mint(sale.address, amountToSell);
//             await olytoken.mint(sale.address, amountToSell);
//             await cUsd.approve(sale.address, amountToSell);
//             await olytoken.approve(sale.address, amountToSell);
//             amountToGet = BigInt(await sale.amountOut(olyInBytes32, amountToSell)).toString()
//             marketPrice = amountToSell / amountToGet;
//             console.log('market price', marketPrice)
//         })

//         it(`Should swap user CUSD for OLY from sales contract, and send user CUSD to treasury`, async () => {
//             const indicatorA = 0;
//             await sale.connect(treasury).updateNext8Hrs(amountToSell,indicatorA);
//             const treasuryBalanceBeforeBuy = BigInt(await cUsd.balanceOf(treasury.address)).toString();
//             const ownerOlyBalBeforeBuy = BigInt(await olytoken.balanceOf(owner.address)).toString();
//             const ownerCUSDBalBeforeBuy = BigInt(await cUsd.balanceOf(owner.address)).toString();
//             await sale.buy('oly',amountToSell);
//             const treasuryBalanceAfterBuy = BigInt(await cUsd.balanceOf(treasury.address)).toString();
//             const ownerOlyBalAfterBuy = BigInt(await olytoken.balanceOf(owner.address)).toString();
//             const ownerCUSDBalAfterBuy = BigInt(await cUsd.balanceOf(owner.address)).toString();

//             expect(treasuryBalanceBeforeBuy).to.equal('0');
//             expect(ownerOlyBalBeforeBuy).to.equal('2000000000000000000000');
//             expect(ownerOlyBalAfterBuy).to.equal('2098715803439706129903');
//             expect(ownerCUSDBalBeforeBuy).to.equal('2000000000000000000000');
//             expect(ownerCUSDBalAfterBuy).to.equal('1900000000000000000001');
//             expect(treasuryBalanceAfterBuy).to.equal('99999999999999999999');
//         })

//         it(`Should swap user OLY for CUSD from sales contract, and burn user OLY`, async () => {
//             const indicatorA = 1;
//             await sale.connect(treasury).updateNext8Hrs(amountToSell,indicatorA);
//             const ownerOlyBalBeforeBuy = BigInt(await olytoken.balanceOf(owner.address)).toString();
//             const ownerCUSDBalBeforeBuy = BigInt(await cUsd.balanceOf(owner.address)).toString();
//             await sale.buy('cUsd',amountToSell);
//             const ownerOlyBalAfterBuy = BigInt(await olytoken.balanceOf(owner.address)).toString();
//             const ownerCUSDBalAfterBuy = BigInt(await cUsd.balanceOf(owner.address)).toString();

//             expect(ownerOlyBalBeforeBuy).to.equal('2000000000000000000000');
//             expect(ownerOlyBalAfterBuy).to.equal('1900000000000000000001');
//             expect(ownerCUSDBalBeforeBuy).to.equal('2000000000000000000000');
//             expect(ownerCUSDBalAfterBuy).to.equal('2098715803439706129903');
//         })

//         it(`Should swap user OLY for CUSD from uniswap, and burn user OLY`, async () => {
//             const ownerOlyBalBeforeBuy = BigInt(await olytoken.balanceOf(owner.address)).toString();
//             const ownerCUSDBalBeforeBuy = BigInt(await cUsd.balanceOf(owner.address)).toString();
//             await sale.buy('cUsd',amountToSell);
//             const ownerOlyBalAfterBuy = BigInt(await olytoken.balanceOf(owner.address)).toString();
//             const ownerCUSDBalAfterBuy = BigInt(await cUsd.balanceOf(owner.address)).toString();

//             expect(ownerOlyBalBeforeBuy).to.equal('2000000000000000000000');
//             expect(ownerOlyBalAfterBuy).to.equal('1900000000000000000000');
//             expect(ownerCUSDBalBeforeBuy).to.equal('2000000000000000000000');
//             expect(ownerCUSDBalAfterBuy).to.equal('2098222224422507599236');
//         })

//         it(`Should swap user OLY for CUSD from uniswap, and burn user OLY`, async () => {
//             const ownerOlyBalBeforeBuy = BigInt(await olytoken.balanceOf(owner.address)).toString();
//             const ownerCUSDBalBeforeBuy = BigInt(await cUsd.balanceOf(owner.address)).toString();
//             await sale.buy('oly',amountToSell);
//             const ownerOlyBalAfterBuy = BigInt(await olytoken.balanceOf(owner.address)).toString();
//             const ownerCUSDBalAfterBuy = BigInt(await cUsd.balanceOf(owner.address)).toString();

//             expect(ownerOlyBalBeforeBuy).to.equal('2000000000000000000000');
//             expect(ownerOlyBalAfterBuy).to.equal('2098222224422507599236');
//             expect(ownerCUSDBalBeforeBuy).to.equal('2000000000000000000000');
//             expect(ownerCUSDBalAfterBuy).to.equal('1900000000000000000000');
//         })
//     })
// })