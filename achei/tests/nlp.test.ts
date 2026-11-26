// Motor local de linguagem: frases do jeito que o cliente fala, com erros de digitação e sem acento.
import { describe, it, expect } from 'vitest';
import { interpretarLocal, casarOpcao, extrairRespostas } from '../src/lib/nlp';
import { PROBLEMAS, problemaPorId } from '../src/data/problemas';

type Esperado = { problema: string } | { produto: string[] } | 'nao_entendi';

const CASOS: [string, Esperado][] = [
  // problemas
  ['minha torneira está pingando', { problema: 'torneira-pingando' }],
  ['torneira da cozinha vazando', { problema: 'torneira-pingando' }],
  ['a torneira não fecha direito', { problema: 'torneira-pingando' }],
  ['torneira gotejando a noite toda', { problema: 'torneira-pingando' }],
  ['tornera pingando', { problema: 'torneira-pingando' }],
  ['MINHA TORNEIRA TA PINGANDO!!!', { problema: 'torneira-pingando' }],
  ['chuveiro não esquenta', { problema: 'trocar-chuveiro' }],
  ['chuveiro nao esquenta', { problema: 'trocar-chuveiro' }],
  ['o banho está saindo frio', { problema: 'trocar-chuveiro' }],
  ['meu chuveiro queimou', { problema: 'trocar-chuveiro' }],
  ['quero trocar o chuveiro', { problema: 'trocar-chuveiro' }],
  ['a resistência do chuveiro queimou', { problema: 'trocar-chuveiro' }],
  ['xuveiro frio', { problema: 'trocar-chuveiro' }],
  ['quero pintar o quarto', { problema: 'pintar-comodo' }],
  ['vou pintar a sala', { problema: 'pintar-comodo' }],
  ['quero mudar a cor da parede', { problema: 'pintar-comodo' }],
  ['preciso pendurar uma prateleira', { problema: 'fixar-parede' }],
  ['pendurar quadro', { problema: 'fixar-parede' }],
  ['como coloco um espelho na parede', { problema: 'fixar-parede' }],
  ['quero furar a parede', { problema: 'fixar-parede' }],
  ['a pia está entupida', { problema: 'pia-entupida' }],
  ['o vaso entupiu', { problema: 'pia-entupida' }],
  ['ralo do banheiro entupido', { problema: 'pia-entupida' }],
  ['a água não desce na pia', { problema: 'pia-entupida' }],
  ['privada entupida', { problema: 'pia-entupida' }],
  ['tá vazando embaixo da pia', { problema: 'vazamento-pia' }],
  ['o armário da pia está molhado', { problema: 'vazamento-pia' }],
  ['descarga não para de correr água', { problema: 'descarga-vazando' }],
  ['barulho de água no vaso', { problema: 'descarga-vazando' }],
  ['a tomada derreteu', { problema: 'trocar-tomada' }],
  ['trocar tomada da cozinha', { problema: 'trocar-tomada' }],
  ['a tomada do microondas está esquentando', { problema: 'trocar-tomada' }],
  ['a lâmpada queimou', { problema: 'iluminacao' }],
  ['quero instalar uma luminária', { problema: 'iluminacao' }],
  ['trocar a lâmpada do quarto', { problema: 'iluminacao' }],
  ['o rejunte do box está preto', { problema: 'rejunte' }],
  ['refazer o rejunte do banheiro', { problema: 'rejunte' }],
  ['porta rangendo', { problema: 'porta' }],
  ['a porta do quarto está arrastando no chão', { problema: 'porta' }],
  ['fechadura emperrada', { problema: 'porta' }],
  ['mofo no teto do banheiro', { problema: 'mofo' }],
  ['parede com bolor', { problema: 'mofo' }],
  ['quero fazer uma horta na varanda', { problema: 'horta' }],
  ['plantar temperos', { problema: 'horta' }],
  ['o disjuntor fica desarmando', { problema: 'disjuntor' }],
  ['a luz cai toda hora', { problema: 'disjuntor' }],
  // produtos
  ['onde fica a fita veda rosca', { produto: ['veda-rosca'] }],
  ['vedarosca', { produto: ['veda-rosca'] }],
  ['veda roska', { produto: ['veda-rosca'] }],
  ['fita teflon', { produto: ['veda-rosca'] }],
  ['onde acho bucha 6', { produto: ['bucha-6'] }],
  ['tem bucha pra drywall?', { produto: ['bucha-drywall'] }],
  ['furadeira', { produto: ['furadeira'] }],
  ['quanto custa a furadeira', { produto: ['furadeira'] }],
  ['chave inglesa', { produto: ['chave-ajustavel'] }],
  ['chave de fenda', { produto: ['jogo-chaves-fenda'] }],
  ['onde fica a fita isolante', { produto: ['fita-isolante'] }],
  ['fita crepe', { produto: ['fita-crepe'] }],
  ['onde fica lâmpada led', { produto: ['lampada-led-branca', 'lampada-led-amarela'] }],
  ['onde encontro tinta branca', { produto: ['tinta-galao-branco', 'tinta-lata-branco', 'tinta-galao-gelo'] }],
  ['rolo de pintura', { produto: ['rolo-la-23'] }],
  ['escada', { produto: ['escada-aluminio'] }],
  ['cola de cano', { produto: ['cola-pvc'] }],
  ['onde fica a mangueirinha da torneira', { produto: ['engate-flexivel'] }],
  ['sifão', { produto: ['sifao-sanfonado'] }],
  ['trena', { produto: ['trena-5m'] }],
  ['nível de bolha', { produto: ['nivel-bolha'] }],
  ['massa corrida', { produto: ['massa-corrida'] }],
  ['luva de borracha', { produto: ['luva-borracha'] }],
  ['terra adubada', { produto: ['terra-adubada'] }],
  ['onde fica o disjuntor', { produto: ['disjuntor-32'] }],
  ['tem chuveiro 220?', { produto: ['chuveiro-220'] }],
  ['alicate', { produto: ['alicate-universal'] }],
  ['regador', { produto: ['regador'] }],
  ['onde fica o óleo desengripante', { produto: ['oleo-desengripante'] }],
  ['parafuso', { produto: ['bucha-6', 'bucha-8'] }],
  // fora do catálogo ou sem sentido
  ['oi', 'nao_entendi'],
  ['', 'nao_entendi'],
  ['   ', 'nao_entendi'],
  ['🙂🙂🙂', 'nao_entendi'],
  ['asdfgh', 'nao_entendi'],
  ['quero um sofá', 'nao_entendi'],
  ['geladeira', 'nao_entendi'],
  ['qual o horário da loja', 'nao_entendi'],
];

describe('entende o cliente', () => {
  it.each(CASOS)('"%s"', (frase, esperado) => {
    const r = interpretarLocal(frase);
    if (esperado === 'nao_entendi') {
      expect(r.tipo).toBe('nao_entendi');
    } else if ('problema' in esperado) {
      expect(r.tipo === 'problema' ? r.problemaId : `${r.tipo}${r.tipo === 'produtos' ? ':' + r.ids.join(',') : ''}`).toBe(esperado.problema);
    } else {
      expect(r.tipo, JSON.stringify(r)).toBe('produtos');
      if (r.tipo === 'produtos') expect(esperado.produto).toContain(r.ids[0]);
    }
  });

  it('frases de gatilho de cada problema levam ao próprio problema', () => {
    const erros: string[] = [];
    for (const p of PROBLEMAS)
      for (const g of p.gatilhos.filter((x) => x.includes(' '))) {
        const r = interpretarLocal(g);
        if (r.tipo !== 'problema' || r.problemaId !== p.id) erros.push(`${p.id} ← "${g}" virou ${r.tipo === 'problema' ? r.problemaId : r.tipo}`);
      }
    expect(erros).toEqual([]);
  });

  it('texto muito longo responde rápido', () => {
    const t0 = performance.now();
    interpretarLocal('minha torneira está pingando '.repeat(80));
    expect(performance.now() - t0).toBeLessThan(500);
  });
});

describe('aproveita o que o cliente já disse', () => {
  const casos: [string, string, Record<string, string>][] = [
    ['meu chuveiro 220 queimou', 'trocar-chuveiro', { voltagem: '220', acao: 'resistencia' }],
    ['quero pintar o banheiro', 'pintar-comodo', { tamanho: 'P', umido: 'sim' }],
    ['pendurar quadro sem furar', 'fixar-parede', { objeto: 'quadro', furar: 'nao' }],
    ['a tomada do micro-ondas derreteu', 'trocar-tomada', { uso: '20', derretida: 'sim' }],
    ['torneira de 1/4 de volta pingando', 'torneira-pingando', { abertura: 'quarto' }],
  ];
  it.each(casos)('"%s"', (frase, id, esperado) => {
    expect(extrairRespostas(problemaPorId[id], frase)).toMatchObject(esperado);
  });
});

describe('entende respostas digitadas', () => {
  const q = (p: string, pergunta: string) => problemaPorId[p].perguntas.find((x) => x.id === pergunta)!;
  const casos: [string, string, string, string | null][] = [
    ['trocar-chuveiro', 'voltagem', '220', '220'],
    ['trocar-chuveiro', 'voltagem', 'é 127', '127'],
    ['trocar-chuveiro', 'voltagem', '110', '127'],
    ['trocar-chuveiro', 'voltagem', 'não sei', 'nao-sei'],
    ['pintar-comodo', 'umido', 'não', 'nao'],
    ['pintar-comodo', 'umido', 'sim', 'sim'],
    ['pintar-comodo', 'furos', 'está lisa', 'nao'],
    ['pia-entupida', 'local', 'é no banheiro', 'banheiro'],
    ['pia-entupida', 'local', 'cozinha', 'cozinha'],
    ['trocar-chuveiro', 'voltagem', 'talvez', null],
  ];
  it.each(casos)('%s.%s: "%s"', (p, pergunta, texto, esperado) => {
    expect(casarOpcao(texto, q(p, pergunta))?.valor ?? null).toBe(esperado);
  });
});
