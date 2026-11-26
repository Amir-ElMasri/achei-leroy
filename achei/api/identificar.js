// POST /api/identificar  → identifica a peça ou o problema a partir de uma foto (Gemini visão)
// Corpo: { imagem: base64 (sem prefixo data:), mime: 'image/jpeg', catalogo: {...} }

import { gerarJSON, promptSistema, SCHEMA_INTERPRETACAO, temChave, lerCorpo } from './_lib/gemini.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ erro: 'Use POST' });
    return;
  }
  if (!temChave()) {
    res.status(503).json({ erro: 'sem_chave' });
    return;
  }
  const { imagem, mime = 'image/jpeg', catalogo } = lerCorpo(req);
  if (!imagem || !catalogo) {
    res.status(400).json({ erro: 'Envie imagem e catalogo' });
    return;
  }
  try {
    const { modelo, dados } = await gerarJSON({
      sistema: promptSistema(catalogo),
      partes: [
        { inlineData: { mimeType: mime, data: imagem } },
        {
          text: 'O cliente fotografou uma peça, um produto ou um problema na casa dele. Em "descricao", diga em até 12 palavras o que você vê na foto. Depois classifique: se a foto mostra um problema (ex.: torneira pingando, rejunte encardido, mofo), use tipo "problema"; se mostra uma peça que ele quer repor ou comprar igual, use tipo "produtos" com os ids mais parecidos. Se não der para identificar, use "nao_entendi".',
        },
      ],
      schema: SCHEMA_INTERPRETACAO,
    });
    res.status(200).json({ ...dados, fonte: 'gemini', modelo });
  } catch (e) {
    res.status(502).json({ erro: 'falha_ia', detalhe: String(e?.message ?? e) });
  }
}
