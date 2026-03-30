import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const PINATA_BASE_URL = "https://api.pinata.cloud/pinning";

export const uploadToPinata = async (filePath: string) => {
  const data = new FormData();
  data.append("file", fs.createReadStream(filePath));

  try {
    const res = await axios.post(
      `${PINATA_BASE_URL}/pinFileToIPFS`,
      data,
      {
        maxBodyLength: Infinity,
        headers: {
          ...data.getHeaders(),
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
      }
    );

    return `${process.env.PINATA_GATEWAY}/${res.data.IpfsHash}`;
  } catch (error: any) {
    console.error("🔴 PINATA ERROR STATUS:", error.response?.status);
    console.error("🔴 PINATA ERROR DATA:", error.response?.data);
    console.error("🔴 PINATA ERROR MESSAGE:", error.message);
    throw new Error("Pinata upload failed");
  }
};
