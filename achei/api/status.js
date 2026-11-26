// GET /api/status → informa se a IA generativa está configurada (sem expor a chave)

import { temChave, modeloPadrao } from './_lib/gemini.js';

export default function handler(_req, res) {
  res.status(200).json({ gemini: temChave(), modelo: temChave() ? modeloPadrao() : null });
}
