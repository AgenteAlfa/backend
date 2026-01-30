require("dotenv").config();
const { app } = require("./app");

const port = Number(process.env.PORT);

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
