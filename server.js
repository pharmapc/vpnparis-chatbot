const express = require('express');
const fetch = require('node-fetch'); // Pour Node.js 18+, vous pouvez utiliser la fonction fetch intégrée
const app = express();

// Pour analyser les requêtes JSON
app.use(express.json());

// Exemple d'endpoint pour gérer les demandes de chat
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  // Récupérer dynamiquement vos produits depuis votre base de données ou API WooCommerce.
  // Ici, nous utilisons des données statiques pour l'exemple.
  const products = [
    { name: "VPN Basique", link: "https://vpnparis.com/shop/vpn-basique" },
    { name: "VPN Premium", link: "https://vpnparis.com/shop/vpn-premium" },
    // Ajoutez d'autres produits si nécessaire
  ];

  // Construire un texte listant vos produits
  let productText = "Voici la liste de nos produits disponibles :\n";
  products.forEach(p => {
    productText += `- ${p.name} : ${p.link}\n`;
  });

  // Construire le prompt complet
  const prompt = `${productText}\nRépondez à la question suivante en intégrant ces liens si pertinent : ${userMessage}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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' // Remplacez par votre clé API
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
    // Extraire la réponse
    const gptResponse = data.choices && data.choices.length > 0 ? data.choices[0].message.content : "Désolé, je n'ai pas pu obtenir de réponse.";

    res.json({ response: gptResponse });
  } catch (error) {
    console.error("Erreur API:", error);
    res.status(500).json({ error: "Erreur lors de l'appel à l'API OpenAI." });
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
