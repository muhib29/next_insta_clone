import { PinataSDK } from "pinata-web3";

export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,         
  pinataGateway: `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}`
});
