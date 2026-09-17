import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const otpDocRef = doc(db, "otps", email);
    const otpDoc = await getDoc(otpDocRef);

    if (!otpDoc.exists()) {
      return NextResponse.json({ error: "OTP not found or expired" }, { status: 400 });
    }

    const data = otpDoc.data();

    // Check expiration
    if (Date.now() > data.expiresAt) {
      // Clean up expired OTP
      await deleteDoc(otpDocRef);
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Check if OTP matches
    if (data.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // OTP is valid, clean it up so it can't be reused
    await deleteDoc(otpDocRef);

    return NextResponse.json({ message: "OTP verified successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
