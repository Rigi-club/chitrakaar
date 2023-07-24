const enableSyntacticSugar = process.env.ENABLE_SYNTACTIC_SUGAR === "true";
const withoutEnlargement = process.env.WITHOUT_ENLARGEMENT === "true";
const dev = process.env.DEV === "true";

console.log("🌟 Built Lambda with the following environment variables!");

console.table({
  "💻 DEV": dev,
  "🍭 ENABLE_SYNTACTIC_SUGAR": enableSyntacticSugar,
  "🔍 WITHOUT_ENLARGEMENT": withoutEnlargement,
});
