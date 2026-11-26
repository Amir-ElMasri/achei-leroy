// Funções serverless da IA (Vercel): o Gemini é simulado, nenhuma chamada real é feita.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

type Res = { code: number; body: any; status(c: number): Res; json(b: any): Res };
const res = (): Res => {
  const r: Res = { code: 0, body: null, status(c) { r.code = c; return r; }, json(b) { r.body = b; return r; } };
  return r;
};
const respostaGemini = (texto: string) =>
  new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: texto }] } }] }), { status: 200, headers: { 'content-type': 'application/json' } });
const OK = '{"tipo":"problema","problema_id":"trocar-chuveiro","respostas":[{"pergunta":"voltagem","opcao":"220"}],"mensagem":"A resistência queimou."}';

describe('api/assistente', () => {
  beforeEach(() => { vi.resetModules(); process.env.GEMINI_API_KEY = 'chave-de-teste'; });
  afterEach(() => { vi.unstubAllGlobals(); delete process.env.GEMINI_API_KEY; });

  it('sem chave configurada responde 503 (o app cai para o modo local)', async () => {
    delete process.env.GEMINI_API_KEY;
    const { default: h } = await import('../api/assistente.js');
    const r = res();
    await h({ method: 'POST', body: { texto: 'x', catalogo: {} } }, r);
    expect(r.code).toBe(503);
  });

  it('rejeita método e corpo inválidos', async () => {
    const { default: h } = await import('../api/assistente.js');
    const r1 = res(); await h({ method: 'GET' }, r1); expect(r1.code).toBe(405);
    const r2 = res(); await h({ method: 'POST', body: {} }, r2); expect(r2.code).toBe(400);
  });

  it('devolve a interpretação do Gemini e nunca expõe a chave', async () => {
    const chamadas: any[] = [];
    vi.stubGlobal('fetch', async (url: string, init: any) => { chamadas.push({ url, init }); return respostaGemini(OK); });
    const { default: h } = await import('../api/assistente.js');
    const r = res();
    await h({ method: 'POST', body: { texto: 'meu chuveiro 220 queimou', catalogo: { problemas: [], produtos: [] } } }, r);
    expect(r.code).toBe(200);
    expect(r.body).toMatchObject({ tipo: 'problema', problema_id: 'trocar-chuveiro', fonte: 'gemini' });
    expect(JSON.stringify(r.body)).not.toContain('chave-de-teste');
    expect(chamadas[0].url).not.toContain('chave-de-teste');
    expect(chamadas[0].init.headers['x-goog-api-key']).toBe('chave-de-teste');
  });

  it('se o modelo não existe na conta, tenta o próximo', async () => {
    const modelos: string[] = [];
    vi.stubGlobal('fetch', async (url: string) => {
      modelos.push(url.split('/models/')[1]);
      return modelos.length === 1 ? new Response('nao encontrado', { status: 404 }) : respostaGemini(OK);
    });
    const { default: h } = await import('../api/assistente.js');
    const r = res();
    await h({ method: 'POST', body: { texto: 'x', catalogo: {} } }, r);
    expect(r.code).toBe(200);
    expect(modelos.length).toBe(2);
  });

  it('aceita JSON cercado de texto e responde 502 quando o Gemini falha', async () => {
    vi.stubGlobal('fetch', async () => respostaGemini('Claro! ' + OK + ' Espero ter ajudado.'));
    let { default: h } = await import('../api/assistente.js');
    const r = res();
    await h({ method: 'POST', body: { texto: 'x', catalogo: {} } }, r);
    expect(r.code).toBe(200);
    vi.resetModules();
    vi.stubGlobal('fetch', async () => new Response('erro', { status: 500 }));
    ({ default: h } = await import('../api/assistente.js'));
    const r2 = res();
    await h({ method: 'POST', body: { texto: 'x', catalogo: {} } }, r2);
    expect(r2.code).toBe(502);
  });
});

describe('api/identificar e api/status', () => {
  beforeEach(() => { vi.resetModules(); process.env.GEMINI_API_KEY = 'chave-de-teste'; });
  afterEach(() => { vi.unstubAllGlobals(); delete process.env.GEMINI_API_KEY; });

  it('envia a foto ao Gemini junto com o pedido', async () => {
    let corpo: any;
    vi.stubGlobal('fetch', async (_u: string, init: any) => { corpo = JSON.parse(init.body); return respostaGemini('{"tipo":"produtos","produto_ids":["sifao-sanfonado"],"mensagem":"Sifão","descricao":"um sifão"}'); });
    const { default: h } = await import('../api/identificar.js');
    const r = res();
    await h({ method: 'POST', body: { imagem: 'AAAA', mime: 'image/jpeg', catalogo: {} } }, r);
    expect(r.code).toBe(200);
    expect(corpo.contents[0].parts[0].inlineData).toEqual({ mimeType: 'image/jpeg', data: 'AAAA' });
  });

  it('status informa se a IA está ligada sem mostrar a chave', async () => {
    const { default: h } = await import('../api/status.js');
    const r = res();
    h({}, r);
    expect(r.body.gemini).toBe(true);
    expect(JSON.stringify(r.body)).not.toContain('chave-de-teste');
  });
});
