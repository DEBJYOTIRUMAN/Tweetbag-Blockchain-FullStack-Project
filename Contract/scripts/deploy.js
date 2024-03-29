const main = async () => {
  const profileImageMinterFactory = await hre.ethers.getContractFactory(
    "ProfileImageNfts"
  );
  const profileImageContract = await profileImageMinterFactory.deploy();

  await profileImageContract.deployed();

  console.log(
    "Profile Image Minter Contract deployed to:",
    profileImageContract.address
  );
};

(async () => {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
