import crypto from "crypto"

// return random 5 digit string
export const generateOTP = () => {
  return crypto.randomInt(10000, 100000).toString() 
}

export const cryptoHash = (string: string, hashingAlorithm: string = "sha256") => {
  return crypto.createHash("sha256")
                   .update(string)
                   .digest("hex");
}

