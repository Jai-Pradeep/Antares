const bcrypt = require("bcrypt");

async function runTest() {
    const password = "Antares@123";
    const saltRounds = 10;

    console.log("--- Starting Bcrypt Test ---");

    // 1. Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("Generated Hash:", hashedPassword);

    // 2. Compare the password with the hash (Successful match)
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log("Check Correct Password:", isMatch ? "✅ Match!" : "❌ No Match");

    // 3. Compare with a wrong password
    const isWrongMatch = await bcrypt.compare("wrongPassword123", hashedPassword);
    console.log("Check Wrong Password:", isWrongMatch ? "✅ Match!" : "❌ No Match");
}

runTest();

