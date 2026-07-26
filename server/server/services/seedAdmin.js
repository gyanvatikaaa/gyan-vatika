const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Ensures one admin account always exists and is already approved,
// so you're never locked out of your own platform.
const seedAdmin = async () => {
  try {
    const email = (process.env.ADMIN_EMAIL || "gyanvatikaaa@gmail.com").toLowerCase();
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log(`ℹ️  Admin account already exists: ${email}`);
      return;
    }

    if (!process.env.ADMIN_PASSWORD) {
      console.warn("⚠️  ADMIN_PASSWORD not set in .env — skipping admin auto-creation");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

    await User.create({
      name: process.env.ADMIN_NAME || "Gyan Vatika Admin",
      email,
      phone: process.env.ADMIN_WHATSAPP || "9893161971",
      password: hashedPassword,
      role: "admin",
      status: "approved", // admin is auto-approved, doesn't wait on anyone
    });

    console.log(`✅ Admin account created: ${email}`);
  } catch (error) {
    console.error("❌ Failed to seed admin account:", error.message);
  }
};

module.exports = seedAdmin;
