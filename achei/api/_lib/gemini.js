// Cliente mínimo da API do Gemini (Google AI Studio), usado pelas funções serverless.
// A chave fica só no servidor (variável de ambiente GEMINI_API_KEY na Vercel), nunca no navegador.

const MODELOS = [...new Set([process.env.GEMINI_MODEL, 'gemini-flash-latest', 'gemini-2.5-flash'].filter(Boolean))];

export const temChave = () => Boolean(process.env.GEMINI_API_KEY);
export const modeloPadrao = () => MODELOS[0];

function lerJSON(texto) {
  try {
    return JSON.parse(texto);
  } catch {
    const m = texto.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('A resposta da IA não veio em JSON');
  }
}

/**
 * Chama o Gemini pedindo uma resposta em JSON.
 * Tenta o modelo configurado e, se ele não existir na conta, cai para os seguintes.
 */
export async function gerarJSON({ sistema, partes, schema }) {
  let ultimoErro = '';
  for (const modelo of MODELOS) {
    for (const usarSchema of [true, false]) {
      const corpo = {
        systemInstruction: { parts: [{ text: sistema }] },
        contents: [{ role: 'user', parts: partes }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          ...(usarSchema && schema ? { responseSchema: schema } : {}),
        },
      };
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
        body: JSON.stringify(corpo),
        signal: AbortSignal.timeout(12000),
      });
      if (r.status === 404) {
        ultimoErro = `modelo ${modelo} não encontrado`;
        break; // próximo modelo
      }
      if (r.status === 400 && usarSchema) {
        ultimoErro = (await r.text()).slice(0, 300);
        continue; // tenta de novo sem schema
      }
      if (!r.ok) throw new Error(`Gemini respondeu ${r.status}: ${(await r.text()).slice(0, 300)}`);
      const j = await r.json();
      const texto = (j.candidates?.[0]?.content?.parts ?? [])
        .filter((p) => !p.thought)
        .map((p) => p.text ?? '')
        .join('');
      return { modelo, dados: lerJSON(texto) };
    }
  }
  throw new Error(ultimoErro || 'Não foi possível chamar o Gemini');
}

export const SCHEMA_INTERPRETACAO = {
  type: 'OBJECT',
  properties: {
    descricao: { type: 'STRING' },
    tipo: { type: 'STRING', enum: ['problema', 'produtos', 'nao_entendi'] },
    problema_id: { type: 'STRING' },
    produto_ids: { type: 'ARRAY', items: { type: 'STRING' } },
    respostas: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { pergunta: { type: 'STRING' }, opcao: { type: 'STRING' } },
        required: ['pergunta', 'opcao'],
      },
    },
    mensagem: { type: 'STRING' },
  },
  required: ['tipo', 'mensagem'],
};

export function promptSistema(catalogo) {
  return `Você é o "Achei", assistente de autoatendimento dentro de uma grande loja de materiais de construção, reforma e decoração no Brasil.
O cliente está na loja, pelo celular. Seu trabalho é entender o que ele precisa e ligar isso ao catálogo abaixo.

Regras:
- Responda SEMPRE em JSON no formato pedido.
- Use SOMENTE ids que existem no catálogo. Nunca invente produto, preço ou corredor.
- Se o cliente descreve um problema ou um projeto que corresponde a um item de "problemas": tipo = "problema", problema_id = o id.
  Em "respostas", inclua apenas as perguntas que o cliente JÁ respondeu de forma clara na mensagem (pergunta = id da pergunta, opcao = valor da opção). Não chute.
- Se o cliente procura um produto específico (ex.: "onde fica a fita veda-rosca", "tem bucha 8?"): tipo = "produtos", produto_ids com até 4 ids, do mais para o menos relevante.
- Se nada do catálogo resolve, ou a mensagem não é sobre a loja: tipo = "nao_entendi".
- "mensagem": 1 ou 2 frases curtas, em português do Brasil, linguagem simples e sem jargão técnico, falando direto com o cliente.
  Para problema, explique em uma frase a causa mais provável. Para produtos, diga em uma frase para que servem. Para nao_entendi, peça para descrever o cômodo e o que aconteceu, ou sugira falar com um especialista.
- Segurança: em assuntos de elétrica, lembre de desligar o disjuntor; em casos de risco (fiação derretida, cheiro de queimado, gás, infiltração grave), recomende um especialista.

Catálogo (JSON):
${JSON.stringify(catalogo)}`;
}

export function lerCorpo(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try {
    return JSON.parse(req.body || '{}');
  } catch {
    return {};
  }
}
