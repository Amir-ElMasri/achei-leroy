// POST /api/assistente  → interpreta a mensagem do cliente com o Gemini
// Corpo: { texto: string, historico?: string[], catalogo: {...} }

import { gerarJSON, promptSistema, SCHEMA_INTERPRETACAO, temChave, lerCorpo } from './_lib/gemini.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ erro: 'Use POST' });
    return;
  }
  if (!temChave()) {
    res.status(503).json({ erro: 'sem_chave', detalhe: 'Defina GEMINI_API_KEY nas variáveis de ambiente da Vercel.' });
    return;
  }
  const { texto, historico = [], catalogo } = lerCorpo(req);
  if (!texto || typeof texto !== 'string' || !catalogo) {
    res.status(400).json({ erro: 'Envie texto e catalogo' });
    return;
  }
  try {
    const contexto = historico.length ? `Conversa até aqui (mais antiga primeiro):\n${historico.slice(-6).join('\n')}\n\n` : '';
    const { modelo, dados } = await gerarJSON({
      sistema: promptSistema(catalogo),
      partes: [{ text: `${contexto}Mensagem do cliente: "${texto.slice(0, 500)}"` }],
      schema: SCHEMA_INTERPRETACAO,
    });
    res.status(200).json({ ...dados, fonte: 'gemini', modelo });
  } catch (e) {
    res.status(502).json({ erro: 'falha_ia', detalhe: String(e?.message ?? e) });
  }
}
