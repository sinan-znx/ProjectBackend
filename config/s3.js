const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = require("@azure/storage-blob");
const dotenv = require("dotenv");
const crypto = require("crypto");
const { promisify } = require("util");
const randomBytes = promisify(crypto.randomBytes);

dotenv.config();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_CONTAINER_NAME || "ecommerce";

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

module.exports.generateUrl = async function () {
  const rawBytes = await randomBytes(16);
  const imgName = rawBytes.toString("hex");

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(imgName);

  const expiresOn = new Date();
  expiresOn.setMinutes(expiresOn.getMinutes() + 120); // 120 minutes expiry

  const sasToken = generateBlobSASQueryParameters({
    containerName,
    blobName: imgName,
    permissions: BlobSASPermissions.parse("w"), // write permission
    expiresOn,
  }, sharedKeyCredential).toString();

  const uploadUrl = `${blobClient.url}?${sasToken}`;
  return uploadUrl;
};
