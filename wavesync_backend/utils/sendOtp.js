import otpGenerator from "otp-generator";

export const generateOTP = () => {
  return otpGenerator.generate(4, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });
};
