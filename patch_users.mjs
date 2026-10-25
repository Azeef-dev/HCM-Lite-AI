import mongoose from "./backend/node_modules/mongoose/index.js";

async function run() {
  await mongoose.connect("mongodb+srv://yihadox265_db_user:KSvSwbWITMNPSSSd@hackhon.zd5uw2c.mongodb.net/");
  const comp = await mongoose.connection.db.collection("companies").findOne();
  if (comp) {
    const res = await mongoose.connection.db.collection("users").updateMany(
      { company: { $exists: false } },
      { $set: { company: comp._id } }
    );
    console.log("Updated existing users:", res.modifiedCount);
  }
  process.exit(0);
}
run();
