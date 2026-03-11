const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(morgan("common"));

let server = http.createServer(app);
let io = socketIO(server);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/", express.static("client/dist"));

const r = express.Router();

import("@gradio/client")
  .then(({ client }) => {
    r.post("/transcribe", async (req, res) => {
      try {
        const message = req.body.message;
        const lang = req.body.lang;
        // console.log(req.body);
        const slm = {
          "bn-BD": "Afsara/csebuetnlp-banglat5",
          "en-US": "Afsara/facebook-bart-large-cnn",
          // "en-US": "Afsara/t5-base",
        };
        console.log(slm[lang]);
        const app = await client(slm[lang]);
        const transcription = await app.predict("/predict", [message]);
        res.send({ message: transcription.data[0] });
      } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
      }
    });
  })
  .catch((err) => console.log(err));
app.use(r);

io.on("connection", (socket) => {
  console.log("New user connected", socket.id);
});

server.listen(port, () => console.log(`Server running on ${port}`));
