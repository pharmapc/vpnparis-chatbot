require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch'); // Si tu utilises Node.js < 18. Pour Node.js 18+ tu peux utiliser global.fetch
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Liste des produits (exemple statique)
const products = [
  { name: "VPN Basique", link: "https://vpnparis.com/shop/vpn-basique" },
  { name: "VPN Premium", link: "https://vpnparis.com/shop/vpn-premium" }
];

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: "Message requis." });
  }

  // Construire la liste des produits
  const productText = products.map(p => `- ${p.name} : ${p.link}`).join("\n");

  // Construction du prompt pour OpenAI
  const prompt = `Voici la liste de nos produits disponibles :\n${productText}\nRépondez à la question suivante en intégrant ces liens si pertinent : ${userMessage}`;

  try {
    // Appel réel à l'API OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
         model: "gpt-4",
         messages: [
           { role: "system", content: "Vous êtes Ava, l'assistante virtuelle de VPNParis. Aidez les clients en leur fournissant des liens directs vers nos produits et des informations pertinentes." },
           { role: "user", content: prompt }
         ],
         temperature: 0.7
      })
    });
    
    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Réponse vide de l'API OpenAI.");
    }
    res.json({ response: data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur API:", error);
    res.status(500).json({ error: "Erreur lors de l'appel à l'API OpenAI." });
  }
});

// Le serveur écoute sur le port dynamique (fourni par Render) ou 3000 par défaut
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
