require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch'); // Pour Node.js 18+, utilise `global.fetch`
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Permettre les requêtes depuis d'autres domaines

// Liste des produits (Tu peux les récupérer dynamiquement depuis WooCommerce si besoin)
const products = [
  { name: "VPN Basique", link: "https://vpnparis.com/shop/vpn-basique" },
  { name: "VPN Premium", link: "https://vpnparis.com/shop/vpn-premium" }
];

// Endpoint pour le chatbot
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  
  if (!userMessage) {
    return res.status(400).json({ error: "Message requis." });
  }

  // Construire le texte listant les produits
  const productText = products.map(p => `- ${p.name} : ${p.link}`).join("\n");

  // Construire le prompt complet
  const prompt = `Voici la liste de nos produits disponibles :\n${productText}\nRépondez à la question suivante en intégrant ces liens si pertinent : ${userMessage}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // Utiliser la clé API depuis un fichier .env
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

    // Vérifier si la réponse de l'API OpenAI est correcte
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Réponse vide de l'API OpenAI.");
    }

    res.json({ response: data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur API:", error);
    res.status(500).json({ error: "Erreur lors de l'appel à l'API OpenAI." });
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});

