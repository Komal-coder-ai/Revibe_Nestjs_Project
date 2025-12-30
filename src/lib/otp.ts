export function generateOTP(length = 4) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export async function sendOtpMock(countryCode: string, mobile: string, code: string) {
  // TODO: integrate real SMS provider (Twilio, MSG91, etc.)
  console.info(`Sending OTP to ${countryCode}${mobile}: ${code}`);
  return true;
}
