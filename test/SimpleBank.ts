import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleBank", function () {
    const ONE_ETHER = ethers.utils.parseEther("1");
    const HALF_ETHER = ethers.utils.parseEther("0.5");
    const CONTRACT_BALANCE = ONE_ETHER;

    async function deployContract() {
        const SimpleBank = await ethers.getContractFactory('SimpleBank');
        const simpleBankContract = await SimpleBank.deploy();
        const [owner, otherAccount] = await ethers.getSigners();
        return { simpleBankContract, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should deploy the contract", async function () {
            const {simpleBankContract} = await loadFixture(deployContract);
            expect(simpleBankContract).to.not.empty;
        });
    });
    
    describe("enroll", function () {
        it("Should enroll user", async function () {
            const {simpleBankContract} = await loadFixture(deployContract);
            await simpleBankContract.enroll();
            expect(await simpleBankContract.isEnroll()).to.be.true;
        });
        it("Should revert if customer is enrolled previously", async function () {
            const {simpleBankContract} = await loadFixture(deployContract);
            await simpleBankContract.enroll();
            await expect(simpleBankContract.enroll()).to.be.revertedWith('User already enrolled');
        });
    });

    describe("deposit", function () {
        it("Should revert if customer is not enrolled", async function () {
            const {simpleBankContract} = await loadFixture(deployContract);
            await expect(simpleBankContract.deposit()).to.be.revertedWith("User not enrolled");
        });
        it("Should revert if amount is not greater than zero", async function () {
            const {simpleBankContract} = await loadFixture(deployContract);
            await simpleBankContract.enroll();
            await expect(simpleBankContract.deposit({value: 0})).to.be.revertedWith("Amount not greater than zero");
        });
        it("Should change user balance", async function () {
            const {simpleBankContract} = await loadFixture(deployContract);
            await simpleBankContract.enroll();
            await simpleBankContract.deposit({value: ONE_ETHER});
            expect(await simpleBankContract.getBalance()).to.be.equal(ONE_ETHER);
        });
    });

    describe("withdraw", function () {
        it("Should revert if customer is not enrolled", async function () {
            const {simpleBankContract} = await loadFixture(deployContract);
            await expect(simpleBankContract.withdraw(HALF_ETHER)).to.be.revertedWith("User not enrolled");
        });
        it("Should revert if amount is not greater than zero", async function () {
            const {simpleBankContract} = await loadFixture(deployContract);
            await simpleBankContract.enroll();
            await expect(simpleBankContract.withdraw(0)).to.be.revertedWith("Amount not greater than zero");
        });
        it("Should revert if funds are not enough", async function () {
            const {simpleBankContract} = await loadFixture(deployContract);
            await simpleBankContract.enroll();
            await expect(simpleBankContract.withdraw(ONE_ETHER)).to.be.revertedWith("Not enough funds");
        });
        it("Should change user balance", async function () {
            const {simpleBankContract} = await loadFixture(deployContract);
            await simpleBankContract.enroll();
            await simpleBankContract.deposit({value: ONE_ETHER});
            await simpleBankContract.withdraw(HALF_ETHER);
            expect(await simpleBankContract.getBalance()).to.be.equal(HALF_ETHER);
        });
    });
    describe("withdrawAll", function () {
        it("Should revert if is not owner", async function () {
            const {simpleBankContract, otherAccount} = await loadFixture(deployContract);
            await simpleBankContract.connect(otherAccount).enroll();
            await expect(simpleBankContract.connect(otherAccount).withdrawAll()).to.be.revertedWith("User not owner");
        });
        it("withdraws all balance should set balance to 0", async function () {
            const {simpleBankContract, otherAccount} = await loadFixture(deployContract);
            await simpleBankContract.enroll();
            await simpleBankContract.deposit({value: ONE_ETHER});
            await simpleBankContract.withdrawAll();
            expect(await simpleBankContract.getBalance()).to.be.equal(0);
        });
        it("withdraws should send ethers to owner account", async function () {
            const {simpleBankContract, owner} = await loadFixture(deployContract);
            await simpleBankContract.enroll();
            await simpleBankContract.deposit({value: ONE_ETHER});
            await expect(await simpleBankContract.withdrawAll()).to.changeEtherBalances([simpleBankContract, owner], [CONTRACT_BALANCE.mul(-1), CONTRACT_BALANCE]);
        });

    }); 

});