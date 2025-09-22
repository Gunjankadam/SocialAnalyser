import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { email } = await req.json();
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: 'kadamgunjan27@gmail.com',
      pass: 'efzb gwjl lkwb lzbq',
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
