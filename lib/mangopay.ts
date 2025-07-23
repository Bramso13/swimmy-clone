import axios from "axios";

const MANGOPAY_BASE_URL =
  process.env.MANGOPAY_BASE_URL || "https://api.sandbox.mangopay.com";
const MANGOPAY_CLIENT_ID = process.env.MANGOPAY_CLIENT_ID!;
const MANGOPAY_API_KEY = process.env.MANGOPAY_API_KEY!;

export const mangopayRequest = async (
  endpoint: string,
  method = "GET",
  data?: any
) => {
  const url = `${MANGOPAY_BASE_URL}/v2.01/${MANGOPAY_CLIENT_ID}${endpoint}`;
  const auth = {
    username: MANGOPAY_CLIENT_ID,
    password: MANGOPAY_API_KEY,
  };
  return axios({
    url,
    method,
    data,
    auth,
  });
};
