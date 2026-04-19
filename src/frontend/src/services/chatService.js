const API_BASE_URL = "http://localhost:8000";

export async function sendChatMessage({ utilisateurId, moduleId, question }) {
  const response = await fetch(`${API_BASE_URL}/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      utilisateur_id: utilisateurId,
      module_id: moduleId,
      question,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || "Aucune reponse(erreur) .");
  }

  return data;
}
