// import connectDB from "@/lib/db";
// import User from "@/model/User";
// import { NextRequest, NextResponse } from "next/server";
// import bcrypt from "bcryptjs";

// export async function POST(req: NextRequest) {
//   try {
//     await connectDB();

//     const { name, email, phone, password, confirmPassword } = await req.json();

//     console.log("📩 Incoming Data:", { name, email, phone });

//     // ✅ validation
//     if (!name || !email || !phone || !password || !confirmPassword) {
//       return NextResponse.json(
//         { error: "All fields are required" },
//         { status: 400 }
//       );
//     }

//     // ✅ password match
//     if (password !== confirmPassword) {
//       return NextResponse.json(
//         { error: "Passwords do not match" },
//         { status: 400 }
//       );
//     }

//     // ✅ check existing user
//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return NextResponse.json(
//         { error: "Email already exists" },
//         { status: 409 }
//       );
//     }

//     // ✅ hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ✅ create user
//     const newUser = await User.create({
//       name,
//       email,
//       phone, // ✅ added
//       password: hashedPassword,
//     });

//     console.log("✅ User Created:", newUser._id);

//     return NextResponse.json({
//       success: true,
//       message: "User registered successfully",
//     });

//   } catch (error: any) {
//     console.error("❌ REGISTER ERROR:", error);

//     return NextResponse.json(
//       { error: error.message || "Server error" },
//       { status: 500 }
//     );
//   }
// }




import connectDB from "@/lib/db";
import User from "@/model/User";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
    } = body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Normalize input
    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).trim();

    // Validate normalized values
    if (!cleanName || !cleanEmail || !cleanPhone) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate phone number
    const cleanPhoneDigits = cleanPhone.replace(/\D/g, "");

    if (cleanPhoneDigits.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    // Validate password
    if (
      typeof password !== "string" ||
      password.length < 6
    ) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create normal user.
    // Never accept is_admin from registration input.
    const newUser = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      is_admin: false,
    });

    console.log("User registered:", newUser._id.toString());

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("REGISTER ERROR:", error);

    // Handle duplicate-key errors from MongoDB
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
