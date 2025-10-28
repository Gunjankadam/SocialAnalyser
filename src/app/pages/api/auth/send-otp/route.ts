import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { email } = await req.json();
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: 'process.env.EMAIL_USER',
      pass: 'process.env.EMAIL_PASS',
    },
  });

  await transporter.sendMail({
    from: `"Social Insights" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    text: `Your OTP is ${otp}`,
  });

  return NextResponse.json({ success: true, otp });
}


