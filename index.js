const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const cors = require("cors");
const shortid = require("shortid");
const mongoose = require("mongoose");

require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

function generateShortId() {
  return shortid.generate();
}

const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortId: { type: String, required: true, unique: true },
});
urlSchema.index({ shortId: 1 }); // Cria um índice no campo shortId

const Url = mongoose.model("Url", urlSchema);
module.exports = Url;

app.use(cors());
// Configurar o Firebase (se estiver usando)
// ...

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  try {
    // Gere o shortId dentro do try...catch
    const shortId = shortid.generate();
    console.log("ShortId gerado:", shortId);
    const newUrl = new Url({ originalUrl, shortId });
    await newUrl.save();
    res.json({ shortId: newUrl.shortId });
  } catch (error) {
    if (error.name === "MongoError") {
      console.error("Erro ao salvar URL no MongoDB:", error);
      res.status(500).json({ error: "Erro ao salvar a URL no banco de dados" });
    } else {
      console.error("Erro ao encurtar URL:", error);
      res.status(500).json({ error: "Erro ao salvar a URL" });
    }
  }
});

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;

  try {
    const url = await Url.findOne({ shortId }).select("originalUrl");

    if (!url) {
      return res.status(404).send("URL não encontrada");
    }

    console.log("Redirecionando para:", url.originalUrl); // Adicione um log para verificar
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Erro ao buscar URL:", error);
    res.status(500).send("Erro interno do servidor");
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
