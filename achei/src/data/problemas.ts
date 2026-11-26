import type { Setor } from './layout';

// Base de conhecimento: problemas que o cliente traz para a loja, com as perguntas que um
// vendedor experiente faria e o kit completo de produtos para resolver — incluindo os
// itens que as pessoas costumam esquecer (e que fazem voltar à loja).

export type Respostas = Record<string, string>;

export interface Opcao {
  valor: string;
  rotulo: string;
  /** palavras que, se aparecerem no texto do cliente, já respondem esta pergunta */
  sinais?: string[];
}

export interface Pergunta {
  id: string;
  texto: string;
  ajuda?: string;
  opcoes: Opcao[];
  quando?: (r: Respostas) => boolean;
}

export interface ItemKit {
  produtoId: string;
  qtd: number;
  motivo: string;
  /** item que as pessoas costumam esquecer */
  esquecido?: boolean;
  /** ferramenta que a pessoa pode já ter em casa */
  ferramenta?: boolean;
}

export interface Problema {
  id: string;
  titulo: string;
  resumo: string;
  gatilhos: string[];
  setor: Setor;
  dificuldade: 'Fácil' | 'Média' | 'Peça ajuda';
  tempo: string;
  perguntas: Pergunta[];
  kit: (r: Respostas) => ItemKit[];
  passos: (r: Respostas) => string[];
  alerta?: (r: Respostas) => string | undefined;
  nota?: (r: Respostas) => string | undefined;
  /** quando o caso pede um especialista em vez de faça-você-mesmo */
  especialista?: (r: Respostas) => string | undefined;
}

const NAO_SEI = { valor: 'nao-sei', rotulo: 'Não sei', sinais: ['nao sei'] };

export const PROBLEMAS: Problema[] = [
  {
    id: 'torneira-pingando',
    titulo: 'Torneira pingando ou vazando',
    resumo: 'Na maioria dos casos é uma peça interna gasta ou a mangueirinha da ligação. É barato e dá para resolver em casa.',
    gatilhos: ['torneira pingando', 'torneira vazando', 'torneira gotejando', 'torneira nao fecha', 'torneira escorrendo', 'vazamento na torneira', 'pingando', 'gotejando', 'pinga'],
    setor: 'Hidráulica',
    dificuldade: 'Fácil',
    tempo: '20 a 40 min',
    perguntas: [
      {
        id: 'abertura',
        texto: 'Como a sua torneira abre?',
        ajuda: 'Repare em quanto a manopla gira até a água sair toda.',
        opcoes: [
          { valor: 'voltas', rotulo: 'Gira várias voltas', sinais: ['varias voltas', 'rosca'] },
          { valor: 'quarto', rotulo: 'Abre com 1/4 de volta', sinais: ['1/4', 'quarto de volta', 'meia volta', 'alavanca'] },
          NAO_SEI,
        ],
      },
      {
        id: 'onde',
        texto: 'Por onde sai a água?',
        opcoes: [
          { valor: 'bica', rotulo: 'Pinga pela bica, mesmo fechada', sinais: ['mesmo fechada', 'pela bica', 'nao fecha'] },
          { valor: 'base', rotulo: 'Vaza na base ou na ligação com o cano', sinais: ['na base', 'embaixo', 'ligacao', 'mangueirinha'] },
        ],
      },
    ],
    kit: (r) => {
      const itens: ItemKit[] = [];
      if (r.onde === 'base') {
        itens.push({ produtoId: 'engate-flexivel', qtd: 1, motivo: 'A mangueirinha ressecada é a causa mais comum de vazamento na ligação.' });
      } else if (r.abertura === 'quarto') {
        itens.push({ produtoId: 'mecanismo-ceramico', qtd: 1, motivo: 'Torneiras de 1/4 de volta pingam quando o miolo de cerâmica gasta.' });
      } else {
        itens.push({ produtoId: 'reparo-torneira', qtd: 1, motivo: 'A borrachinha gasta deixa a água passar mesmo com a torneira fechada.' });
      }
      itens.push({ produtoId: 'veda-rosca', qtd: 1, motivo: 'Sem ela, a rosca volta a vazar depois de remontar.', esquecido: true });
      itens.push({ produtoId: 'chave-ajustavel', qtd: 1, motivo: 'Para soltar e apertar a peça sem espanar.', ferramenta: true });
      return itens;
    },
    nota: (r) => (r.abertura === 'nao-sei' && r.onde !== 'base' ? 'Dica: feche o registro, desmonte a torneira e traga a peça antiga. Comparar no corredor é o jeito mais seguro de acertar.' : undefined),
    passos: (r) =>
      r.onde === 'base'
        ? ['Feche o registro da água.', 'Solte a mangueirinha antiga com a chave ajustável.', 'Enrole 6 a 8 voltas de veda-rosca nas roscas, no sentido do aperto.', 'Rosqueie a mangueirinha nova, primeiro com a mão e depois meia volta com a chave.', 'Abra o registro e confira se secou.']
        : ['Feche o registro da água.', 'Tire a manopla (às vezes há um parafuso escondido sob a tampinha).', 'Desrosqueie a peça interna com a chave ajustável.', 'Coloque a peça nova e remonte, sem apertar demais.', 'Abra o registro e teste.'],
  },
  {
    id: 'trocar-chuveiro',
    titulo: 'Chuveiro sem esquentar ou para trocar',
    resumo: 'Quando o chuveiro só sai frio, muitas vezes basta trocar a resistência. O mais importante é acertar a voltagem.',
    gatilhos: ['chuveiro', 'chuveiro nao esquenta', 'chuveiro frio', 'chuveiro queimou', 'chuveiro queimado', 'agua fria', 'resistencia queimou', 'trocar chuveiro', 'banho frio'],
    setor: 'Elétrica',
    dificuldade: 'Média',
    tempo: '20 a 40 min',
    perguntas: [
      {
        id: 'acao',
        texto: 'O que você quer fazer?',
        opcoes: [
          { valor: 'resistencia', rotulo: 'Ele parou de esquentar', sinais: ['nao esquenta', 'frio', 'queimou', 'resistencia', 'parou de esquentar'] },
          { valor: 'trocar', rotulo: 'Trocar o chuveiro todo', sinais: ['trocar o chuveiro', 'chuveiro novo', 'comprar chuveiro', 'trocar chuveiro'] },
        ],
      },
      {
        id: 'voltagem',
        texto: 'Qual a voltagem do chuveiro de hoje?',
        ajuda: 'Está escrita na etiqueta ou no corpo do chuveiro antigo. Não chute: na voltagem errada ele queima ou esquenta pouco.',
        opcoes: [
          { valor: '127', rotulo: '127 V (ou 110 V)', sinais: ['127', '110'] },
          { valor: '220', rotulo: '220 V', sinais: ['220'] },
          NAO_SEI,
        ],
      },
    ],
    kit: (r) => {
      const itens: ItemKit[] = [];
      const v = r.voltagem === '220' ? '220' : r.voltagem === '127' ? '127' : null;
      if (r.acao === 'resistencia') {
        if (v) itens.push({ produtoId: `resistencia-${v}`, qtd: 1, motivo: 'A peça que esquenta a água. Confira se o modelo bate com o seu chuveiro.' });
      } else if (v) {
        itens.push({ produtoId: `chuveiro-${v}`, qtd: 1, motivo: `Chuveiro na mesma voltagem da sua instalação (${v} V).` });
        itens.push({ produtoId: 'veda-rosca', qtd: 1, motivo: 'Para o chuveiro não vazar na rosca do cano.', esquecido: true });
      }
      itens.push({ produtoId: 'chave-teste', qtd: 1, motivo: 'Para confirmar que a energia está desligada antes de mexer.', esquecido: true, ferramenta: true });
      itens.push({ produtoId: 'fita-isolante', qtd: 1, motivo: 'Para isolar bem as emendas dos fios.' });
      return itens;
    },
    alerta: () => 'Desligue o disjuntor do chuveiro antes de começar. Se os fios estiverem escurecidos ou derretidos, pare e chame um eletricista.',
    especialista: (r) => (r.voltagem === 'nao-sei' ? 'Sem a voltagem não dá para indicar o produto com segurança. Um especialista pode te ajudar a descobrir.' : undefined),
    passos: (r) =>
      r.acao === 'resistencia'
        ? ['Desligue o disjuntor do chuveiro e confira com a chave de teste.', 'Abra a tampa traseira do chuveiro.', 'Solte a resistência queimada (anote a posição dela).', 'Encaixe a nova na mesma posição e feche o chuveiro.', 'Abra a água por 30 segundos antes de religar o disjuntor.']
        : ['Desligue o disjuntor do chuveiro e confira com a chave de teste.', 'Desconecte os fios e desrosqueie o chuveiro antigo.', 'Enrole veda-rosca no cano e rosqueie o novo.', 'Ligue os fios e isole bem as emendas.', 'Abra a água por 30 segundos antes de religar o disjuntor.'],
  },
  {
    id: 'pintar-comodo',
    titulo: 'Pintar um cômodo',
    resumo: 'Calculo a quantidade de tinta pelo tamanho do cômodo e junto tudo o que precisa para não voltar à loja no meio da pintura.',
    gatilhos: ['pintar', 'pintar parede', 'pintar quarto', 'pintar sala', 'pintar comodo', 'pintura', 'tinta', 'renovar parede', 'mudar a cor'],
    setor: 'Pintura e acabamento',
    dificuldade: 'Fácil',
    tempo: '1 dia',
    perguntas: [
      {
        id: 'tamanho',
        texto: 'Qual o tamanho do cômodo?',
        opcoes: [
          { valor: 'P', rotulo: 'Pequeno: banheiro ou quarto pequeno', sinais: ['banheiro', 'pequeno', 'lavabo'] },
          { valor: 'M', rotulo: 'Médio: quarto ou sala comum', sinais: ['quarto', 'medio'] },
          { valor: 'G', rotulo: 'Grande: sala ampla', sinais: ['sala grande', 'grande', 'ampla'] },
        ],
      },
      {
        id: 'umido',
        texto: 'É um lugar úmido, como banheiro, cozinha ou lavanderia?',
        opcoes: [
          { valor: 'sim', rotulo: 'Sim', sinais: ['banheiro', 'cozinha', 'lavanderia', 'umido', 'mofo'] },
          { valor: 'nao', rotulo: 'Não' },
        ],
      },
      {
        id: 'furos',
        texto: 'A parede tem furos ou imperfeições?',
        opcoes: [
          { valor: 'sim', rotulo: 'Sim, alguns furinhos', sinais: ['furo', 'buraco', 'imperfeic'] },
          { valor: 'nao', rotulo: 'Não, está lisa' },
        ],
      },
    ],
    kit: (r) => {
      const { tinta, qtd } = calcularTinta(r);
      const itens: ItemKit[] = [
        { produtoId: tinta, qtd, motivo: r.umido === 'sim' ? 'Tinta com aditivo antimofo, indicada para áreas úmidas.' : 'Quantidade calculada para duas demãos.' },
        { produtoId: 'rolo-la-23', qtd: 1, motivo: 'Para cobrir as paredes rápido e por igual.' },
        { produtoId: 'bandeja-pintura', qtd: 1, motivo: 'Sem ela não dá para usar o rolo.', esquecido: true },
        { produtoId: 'trincha-2', qtd: 1, motivo: 'Para cantos, rodapés e recortes.' },
        { produtoId: 'fita-crepe', qtd: 1, motivo: 'Protege tomadas, rodapés e batentes.', esquecido: true },
        { produtoId: 'lona-plastica', qtd: 1, motivo: 'Protege o chão e os móveis.', esquecido: true },
        { produtoId: 'lixa-150', qtd: 1, motivo: 'Uma lixada leve faz a tinta aderir melhor.' },
      ];
      if (r.furos === 'sim') {
        itens.push({ produtoId: 'massa-corrida', qtd: 1, motivo: 'Para tapar os furinhos antes de pintar.' });
        itens.push({ produtoId: 'espatula', qtd: 1, motivo: 'Para aplicar e alisar a massa.', ferramenta: true });
      }
      return itens;
    },
    nota: (r) => {
      const { area, litros, descricao } = calcularTinta(r);
      return area ? `Cálculo: cerca de ${area} m² de parede × 2 demãos ≈ ${litros.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} L de tinta, por isso ${descricao}.` : undefined;
    },
    passos: (r) => [
      'Afaste os móveis, cubra o chão com a lona e proteja rodapés e tomadas com fita crepe.',
      ...(r.furos === 'sim' ? ['Tape os furos com massa corrida, espere secar e lixe.'] : ['Lixe levemente a parede e tire o pó com um pano seco.']),
      'Pinte os cantos e recortes com a trincha.',
      'Passe a primeira demão com o rolo, em faixas.',
      'Espere secar (veja na lata, geralmente 4 horas) e passe a segunda demão.',
      'Tire a fita crepe com a tinta ainda levemente úmida.',
    ],
  },
  {
    id: 'fixar-parede',
    titulo: 'Pendurar prateleira, quadro ou espelho',
    resumo: 'O segredo é usar a bucha certa para o tipo de parede. Errar aqui é o que faz a prateleira cair.',
    gatilhos: ['pendurar', 'prateleira', 'colocar prateleira', 'instalar prateleira', 'quadro', 'pendurar quadro', 'espelho', 'fixar na parede', 'furar parede', 'furar a parede'],
    setor: 'Ferragens',
    dificuldade: 'Fácil',
    tempo: '30 min',
    perguntas: [
      {
        id: 'objeto',
        texto: 'O que você vai pendurar?',
        opcoes: [
          { valor: 'prateleira', rotulo: 'Prateleira', sinais: ['prateleira'] },
          { valor: 'quadro', rotulo: 'Quadro ou espelho leve', sinais: ['quadro', 'espelho'] },
        ],
      },
      {
        id: 'parede',
        texto: 'Como é a parede?',
        ajuda: 'Bata com o nó do dedo: se o som for oco, provavelmente é drywall (placa de gesso).',
        opcoes: [
          { valor: 'alvenaria', rotulo: 'Tijolo ou concreto', sinais: ['tijolo', 'concreto', 'alvenaria'] },
          { valor: 'drywall', rotulo: 'Drywall (gesso, oca)', sinais: ['drywall', 'gesso', 'oca'] },
          { valor: 'nao-sei', rotulo: 'Não sei' },
        ],
      },
      {
        id: 'furar',
        texto: 'Pode furar a parede?',
        quando: (r) => r.objeto === 'quadro',
        opcoes: [
          { valor: 'sim', rotulo: 'Pode furar' },
          { valor: 'nao', rotulo: 'Prefiro não furar', sinais: ['sem furar', 'aluguel', 'alugado'] },
        ],
      },
    ],
    kit: (r) => {
      if (r.objeto === 'quadro' && r.furar === 'nao') {
        return [{ produtoId: 'fita-dupla-face', qtd: 1, motivo: 'Segura quadros e espelhos leves sem nenhum furo.' }];
      }
      const drywall = r.parede === 'drywall';
      const itens: ItemKit[] = [];
      if (r.objeto === 'prateleira') {
        itens.push({ produtoId: 'prateleira-mdf', qtd: 1, motivo: 'A prateleira em si (60 x 20 cm).' });
        itens.push({ produtoId: 'mao-francesa', qtd: 1, motivo: 'O par de suportes que segura a prateleira por baixo.' });
      }
      itens.push(
        drywall
          ? { produtoId: 'bucha-drywall', qtd: 1, motivo: 'Bucha comum não segura em parede oca; esta abre atrás da placa.' }
          : { produtoId: 'bucha-6', qtd: 1, motivo: 'Bucha e parafuso do tamanho certo para a broca de 6 mm.' },
      );
      itens.push({ produtoId: 'broca-concreto-6', qtd: 1, motivo: 'Faz o furo na medida da bucha.' });
      itens.push({ produtoId: 'furadeira', qtd: 1, motivo: 'Para fazer o furo na parede.', ferramenta: true });
      itens.push({ produtoId: 'nivel-bolha', qtd: 1, motivo: 'Para não ficar torto.', esquecido: true, ferramenta: true });
      itens.push({ produtoId: 'trena-5m', qtd: 1, motivo: 'Para marcar a altura e a distância entre os furos.', ferramenta: true });
      return itens;
    },
    nota: (r) => (r.parede === 'nao-sei' ? 'Separei a bucha para tijolo, que é a parede mais comum. Se ao bater o som for oco, troque pela bucha para drywall (mesmo corredor).' : undefined),
    alerta: () => 'Antes de furar, evite a linha reta acima e abaixo de tomadas e interruptores: costuma haver fios e canos passando ali.',
    passos: (r) => [
      'Marque a altura com a trena e use o nível para fazer a linha reta.',
      'Fure com a broca de 6 mm na profundidade da bucha.',
      'Coloque a bucha no furo (bata de leve se precisar).',
      r.objeto === 'prateleira' ? 'Parafuse os suportes e apoie a prateleira por cima.' : 'Parafuse deixando a cabeça um pouco para fora e pendure o quadro.',
      'Confira com o nível antes de apertar de vez.',
    ],
  },
  {
    id: 'pia-entupida',
    titulo: 'Pia, ralo ou vaso entupido',
    resumo: 'Antes de qualquer produto químico, a ventosa e a mola resolvem a maior parte dos entupimentos.',
    gatilhos: ['entupida', 'entupido', 'entupiu', 'pia entupida', 'ralo entupido', 'vaso entupido', 'privada entupida', 'agua nao desce', 'desentupir', 'escoando devagar'],
    setor: 'Hidráulica',
    dificuldade: 'Fácil',
    tempo: '15 a 30 min',
    perguntas: [
      {
        id: 'local',
        texto: 'Onde está entupido?',
        opcoes: [
          { valor: 'cozinha', rotulo: 'Pia da cozinha', sinais: ['cozinha', 'pia da cozinha'] },
          { valor: 'banheiro', rotulo: 'Pia do banheiro', sinais: ['pia do banheiro', 'lavatorio'] },
          { valor: 'vaso', rotulo: 'Vaso sanitário', sinais: ['vaso', 'privada'] },
          { valor: 'ralo', rotulo: 'Ralo do chuveiro', sinais: ['ralo', 'box'] },
        ],
      },
    ],
    kit: (r) => {
      if (r.local === 'vaso')
        return [
          { produtoId: 'desentupidor-vaso', qtd: 1, motivo: 'Formato próprio para encaixar no fundo do vaso.' },
          { produtoId: 'luva-borracha', qtd: 1, motivo: 'Para proteger as mãos.', esquecido: true },
        ];
      if (r.local === 'ralo')
        return [
          { produtoId: 'sonda-desentupidora', qtd: 1, motivo: 'Ralo entope com cabelo; a mola puxa ou quebra o bolo.' },
          { produtoId: 'luva-borracha', qtd: 1, motivo: 'Para proteger as mãos.', esquecido: true },
        ];
      return [
        { produtoId: 'desentupidor-ventosa', qtd: 1, motivo: 'Resolve a maioria dos entupimentos de pia.' },
        { produtoId: 'sonda-desentupidora', qtd: 1, motivo: 'Se a ventosa não resolver, a mola alcança mais fundo.' },
        { produtoId: 'luva-borracha', qtd: 1, motivo: 'Para proteger as mãos.', esquecido: true },
      ];
    },
    nota: (r) => (r.local === 'cozinha' ? 'Na cozinha, gordura acumulada é a causa mais comum. Despejar água bem quente com detergente antes de usar a ventosa ajuda bastante.' : undefined),
    passos: (r) =>
      r.local === 'vaso'
        ? ['Deixe um pouco de água no vaso.', 'Encaixe o desentupidor bem no fundo.', 'Empurre e puxe com força umas 10 vezes, sem tirar a vedação.', 'Dê descarga para testar.']
        : ['Tampe o ladrão da pia com um pano molhado, se houver.', 'Deixe alguns centímetros de água e use a ventosa com movimentos firmes.', 'Se não resolver, abra o sifão embaixo da pia (com um balde) e passe a mola pelo cano.', 'Monte tudo de volta e deixe a água correr.'],
  },
  {
    id: 'vazamento-pia',
    titulo: 'Vazamento embaixo da pia',
    resumo: 'Quase sempre vem do sifão (o cano em curva) ou da mangueirinha da torneira. As duas peças são simples de trocar.',
    gatilhos: ['vazando embaixo da pia', 'vazamento embaixo da pia', 'embaixo da pia', 'sifao vazando', 'armario da pia molhado', 'goteira embaixo da pia', 'cano da pia vazando'],
    setor: 'Hidráulica',
    dificuldade: 'Fácil',
    tempo: '20 min',
    perguntas: [
      {
        id: 'origem',
        texto: 'De onde a água está saindo?',
        ajuda: 'Seque tudo com papel e observe onde aparece a primeira gota.',
        opcoes: [
          { valor: 'sifao', rotulo: 'Do cano em curva (sifão)', sinais: ['sifao', 'cano em curva', 'sanfonado'] },
          { valor: 'flexivel', rotulo: 'Da mangueirinha da torneira', sinais: ['mangueirinha', 'flexivel', 'engate'] },
          { valor: 'nao-sei', rotulo: 'Não consigo ver' },
        ],
      },
    ],
    kit: (r) => {
      const itens: ItemKit[] = [];
      if (r.origem !== 'flexivel') itens.push({ produtoId: 'sifao-sanfonado', qtd: 1, motivo: 'Sifão novo com vedações novas.' });
      if (r.origem !== 'sifao') {
        itens.push({ produtoId: 'engate-flexivel', qtd: 1, motivo: 'Mangueirinha nova para a ligação da torneira.' });
        itens.push({ produtoId: 'veda-rosca', qtd: 1, motivo: 'Para vedar a rosca da mangueirinha.', esquecido: true });
        itens.push({ produtoId: 'chave-ajustavel', qtd: 1, motivo: 'Para soltar e apertar as porcas.', ferramenta: true });
      }
      itens.push({ produtoId: 'luva-borracha', qtd: 1, motivo: 'A água do sifão é suja.', esquecido: true });
      return itens;
    },
    nota: (r) => (r.origem === 'nao-sei' ? 'Separei as duas peças mais prováveis. Se descobrir qual é, você pode tirar a outra da lista.' : undefined),
    passos: () => ['Feche o registro e coloque um balde embaixo da pia.', 'Desrosqueie a peça antiga com a mão (ou com a chave, se estiver presa).', 'Instale a nova, apertando com a mão até firmar.', 'Abra a água e passe papel nas conexões para conferir se secou.'],
  },
  {
    id: 'descarga-vazando',
    titulo: 'Descarga com água escorrendo no vaso',
    resumo: 'Água correndo sem parar no vaso é sinal de peça interna gasta. Além do barulho, isso pesa na conta de água.',
    gatilhos: ['descarga', 'descarga vazando', 'agua correndo no vaso', 'caixa acoplada', 'descarga nao para', 'vaso vazando', 'descarga quebrada', 'barulho de agua no vaso'],
    setor: 'Hidráulica',
    dificuldade: 'Média',
    tempo: '30 a 60 min',
    perguntas: [
      {
        id: 'tipo',
        texto: 'Como é a sua descarga?',
        opcoes: [
          { valor: 'acoplada', rotulo: 'Caixa em cima do vaso', sinais: ['caixa acoplada', 'caixa em cima', 'acoplada'] },
          { valor: 'parede', rotulo: 'Botão ou válvula na parede', sinais: ['valvula', 'parede', 'hydra'] },
        ],
      },
    ],
    kit: (r) =>
      r.tipo === 'parede'
        ? []
        : [
            { produtoId: 'reparo-caixa-acoplada', qtd: 1, motivo: 'Troca boia e válvula de uma vez.' },
            { produtoId: 'engate-flexivel', qtd: 1, motivo: 'Aproveite para trocar a mangueirinha, que costuma estar ressecada.' },
            { produtoId: 'veda-rosca', qtd: 1, motivo: 'Para a ligação não vazar.', esquecido: true },
            { produtoId: 'luva-borracha', qtd: 1, motivo: 'Para mexer dentro da caixa.', esquecido: true },
          ],
    especialista: (r) => (r.tipo === 'parede' ? 'Válvula de parede tem reparos específicos por modelo e fica dentro da parede. Um especialista da Hidráulica identifica a peça certa com você.' : undefined),
    passos: () => ['Feche o registro do vaso e dê descarga para esvaziar a caixa.', 'Solte a mangueirinha e retire a boia e a válvula antigas.', 'Monte o kit novo seguindo o manual da embalagem.', 'Ligue a mangueirinha nova com veda-rosca e abra o registro.', 'Ajuste a altura da boia até a água parar no nível marcado.'],
  },
  {
    id: 'trocar-tomada',
    titulo: 'Trocar tomada',
    resumo: 'É uma troca simples, desde que a energia esteja desligada e a tomada seja a certa para o aparelho.',
    gatilhos: ['tomada', 'trocar tomada', 'tomada quebrada', 'tomada derretida', 'tomada queimada', 'tomada solta', 'tomada nao funciona', 'tomada esquentando'],
    setor: 'Elétrica',
    dificuldade: 'Média',
    tempo: '15 min',
    perguntas: [
      {
        id: 'uso',
        texto: 'Para que é a tomada?',
        opcoes: [
          { valor: '10', rotulo: 'Uso comum (TV, carregador, luminária)', sinais: ['tv', 'carregador', 'comum'] },
          { valor: '20', rotulo: 'Aparelho forte (micro-ondas, air fryer, máquina de lavar)', sinais: ['micro-ondas', 'microondas', 'air fryer', 'airfryer', 'maquina de lavar', 'forno', '20a'] },
          NAO_SEI,
        ],
      },
      {
        id: 'derretida',
        texto: 'A tomada antiga está derretida ou escurecida?',
        opcoes: [
          { valor: 'sim', rotulo: 'Sim', sinais: ['derretida', 'derreteu', 'queimada', 'escurecida', 'preta'] },
          { valor: 'nao', rotulo: 'Não, só quebrou ou soltou', sinais: ['quebrada', 'solta', 'quebrou'] },
        ],
      },
    ],
    kit: (r) => [
      { produtoId: r.uso === '20' ? 'tomada-20a' : 'tomada-10a', qtd: 1, motivo: r.uso === '20' ? 'Aparelhos fortes pedem tomada de 20 A.' : 'A tomada padrão para uso comum.' },
      { produtoId: 'chave-teste', qtd: 1, motivo: 'Confirma que a energia foi desligada.', esquecido: true, ferramenta: true },
      { produtoId: 'jogo-chaves-fenda', qtd: 1, motivo: 'Para soltar a placa e os bornes da tomada.', ferramenta: true },
    ],
    alerta: (r) =>
      r.derretida === 'sim'
        ? 'Tomada derretida indica aquecimento por sobrecarga ou mau contato. Trocar só a tomada pode não resolver: vale um eletricista conferir a fiação.'
        : 'Desligue o disjuntor do circuito e confira com a chave de teste antes de abrir a tomada.',
    especialista: (r) => (r.derretida === 'sim' ? 'Um especialista em Elétrica pode avaliar se a fiação aguenta o aparelho.' : undefined),
    nota: (r) => (r.uso === 'nao-sei' ? 'Separei a tomada de uso comum (10 A). Se ela for alimentar micro-ondas, air fryer ou máquina de lavar, confirme com um especialista.' : undefined),
    passos: () => ['Desligue o disjuntor e teste os furos da tomada com a chave de teste.', 'Solte a placa e os parafusos e puxe a tomada com cuidado.', 'Anote ou fotografe qual fio vai em qual borne.', 'Ligue os fios na tomada nova na mesma posição e aperte bem.', 'Encaixe na caixinha, coloque a placa e religue o disjuntor.'],
  },
  {
    id: 'iluminacao',
    titulo: 'Trocar lâmpada ou instalar luminária',
    resumo: 'Para trocar a lâmpada, basta acertar o encaixe e a cor da luz. Para luminária nova, também vale desligar a energia.',
    gatilhos: ['lampada', 'lampada queimada', 'trocar lampada', 'luminaria', 'instalar luminaria', 'plafon', 'lustre', 'luz do teto', 'luz queimou', 'iluminacao'],
    setor: 'Iluminação',
    dificuldade: 'Fácil',
    tempo: '10 a 30 min',
    perguntas: [
      {
        id: 'acao',
        texto: 'O que você vai fazer?',
        opcoes: [
          { valor: 'lampada', rotulo: 'Só trocar a lâmpada', sinais: ['lampada'] },
          { valor: 'luminaria', rotulo: 'Instalar uma luminária no teto', sinais: ['luminaria', 'plafon', 'lustre'] },
        ],
      },
      {
        id: 'cor',
        texto: 'Que luz você prefere?',
        opcoes: [
          { valor: 'branca', rotulo: 'Branca (cozinha, banheiro, estudo)', sinais: ['branca', 'cozinha', 'banheiro'] },
          { valor: 'amarela', rotulo: 'Amarela (quarto e sala)', sinais: ['amarela', 'quarto', 'sala', 'aconchegante'] },
        ],
        quando: (r) => r.acao === 'lampada',
      },
    ],
    kit: (r) =>
      r.acao === 'luminaria'
        ? [
            { produtoId: 'plafon-led', qtd: 1, motivo: 'Luminária com LED embutido, não precisa de lâmpada.' },
            { produtoId: 'conector-alavanca', qtd: 1, motivo: 'Emenda os fios do teto com segurança e sem fita.', esquecido: true },
            { produtoId: 'chave-teste', qtd: 1, motivo: 'Confirma que a energia está desligada.', ferramenta: true },
            { produtoId: 'escada-aluminio', qtd: 1, motivo: 'Para alcançar o teto com segurança.', ferramenta: true },
          ]
        : [{ produtoId: r.cor === 'amarela' ? 'lampada-led-amarela' : 'lampada-led-branca', qtd: 1, motivo: 'LED de 9 W ilumina como a antiga de 60 W e gasta bem menos.' }],
    passos: (r) =>
      r.acao === 'luminaria'
        ? ['Desligue o disjuntor do circuito da luz e confira com a chave de teste.', 'Fixe a base da luminária no teto.', 'Emende os fios com os conectores de alavanca.', 'Encaixe a cúpula e religue o disjuntor.']
        : ['Desligue o interruptor e espere a lâmpada esfriar.', 'Desrosqueie a lâmpada antiga.', 'Rosqueie a nova até firmar, sem forçar.'],
  },
  {
    id: 'rejunte',
    titulo: 'Rejunte encardido ou soltando',
    resumo: 'Se está só sujo, uma boa limpeza resolve. Se está rachado ou soltando, o certo é raspar e refazer.',
    gatilhos: ['rejunte', 'rejunte encardido', 'rejunte preto', 'rejunte sujo', 'rejunte soltando', 'rejunte rachado', 'azulejo', 'refazer rejunte', 'box encardido'],
    setor: 'Pintura e acabamento',
    dificuldade: 'Média',
    tempo: '2 a 4 horas',
    perguntas: [
      {
        id: 'estado',
        texto: 'Como está o rejunte?',
        opcoes: [
          { valor: 'sujo', rotulo: 'Só encardido (sujo)', sinais: ['encardido', 'sujo', 'preto', 'manchado'] },
          { valor: 'solto', rotulo: 'Rachado ou soltando', sinais: ['soltando', 'rachado', 'quebrado', 'caindo', 'faltando'] },
        ],
      },
    ],
    kit: (r) =>
      r.estado === 'sujo'
        ? [
            { produtoId: 'limpa-rejunte', qtd: 1, motivo: 'Solta a sujeira impregnada.' },
            { produtoId: 'escova-limpeza', qtd: 1, motivo: 'Para esfregar dentro das juntas.' },
            { produtoId: 'luva-borracha', qtd: 1, motivo: 'O produto agride a pele.', esquecido: true },
          ]
        : [
            { produtoId: 'raspador-rejunte', qtd: 1, motivo: 'Tira o rejunte velho sem quebrar o azulejo.' },
            { produtoId: 'rejunte-flex', qtd: 1, motivo: 'Rejunte novo que trinca menos.' },
            { produtoId: 'desempenadeira-borracha', qtd: 1, motivo: 'Espalha e aperta o rejunte nas juntas.' },
            { produtoId: 'esponja-dupla', qtd: 1, motivo: 'Para tirar o excesso antes de secar.', esquecido: true },
            { produtoId: 'luva-borracha', qtd: 1, motivo: 'Protege as mãos.', esquecido: true },
          ],
    passos: (r) =>
      r.estado === 'sujo'
        ? ['Aplique o limpa rejunte e espere o tempo indicado no rótulo.', 'Esfregue as juntas com a escova.', 'Enxágue bem e deixe secar com a janela aberta.']
        : ['Raspe o rejunte velho até uns 2 mm de profundidade.', 'Limpe o pó das juntas.', 'Prepare o rejunte e espalhe na diagonal com a desempenadeira.', 'Depois de uns 15 minutos, tire o excesso com a esponja úmida.', 'Espere 24 horas antes de molhar.'],
  },
  {
    id: 'porta',
    titulo: 'Porta rangendo, caída ou com fechadura ruim',
    resumo: 'Rangido se resolve com lubrificante; porta caída pede dobradiça; fechadura travada pede uma nova do tamanho certo.',
    gatilhos: ['porta', 'porta rangendo', 'porta rangendo', 'porta chiando', 'porta caida', 'porta raspando', 'porta arrastando', 'fechadura', 'fechadura quebrada', 'fechadura emperrada', 'macaneta', 'rangido'],
    setor: 'Ferragens',
    dificuldade: 'Fácil',
    tempo: '10 a 40 min',
    perguntas: [
      {
        id: 'problema',
        texto: 'O que está acontecendo com a porta?',
        opcoes: [
          { valor: 'range', rotulo: 'Range (faz barulho)', sinais: ['range', 'rangendo', 'rangido', 'chiando', 'barulho'] },
          { valor: 'caida', rotulo: 'Está caída ou raspando no chão', sinais: ['caida', 'raspando', 'arrastando'] },
          { valor: 'fechadura', rotulo: 'A fechadura travou ou quebrou', sinais: ['fechadura', 'macaneta', 'trinco', 'chave nao gira'] },
        ],
      },
      {
        id: 'local',
        texto: 'É uma porta de dentro de casa ou que dá para a rua?',
        quando: (r) => r.problema === 'fechadura',
        opcoes: [
          { valor: 'interna', rotulo: 'Dentro de casa (quarto, banheiro)', sinais: ['quarto', 'banheiro', 'interna'] },
          { valor: 'externa', rotulo: 'Dá para a rua', sinais: ['rua', 'entrada', 'frente', 'externa'] },
        ],
      },
    ],
    kit: (r) => {
      if (r.problema === 'range') return [{ produtoId: 'oleo-desengripante', qtd: 1, motivo: 'Uma borrifada em cada dobradiça acaba com o rangido.' }];
      if (r.problema === 'caida')
        return [
          { produtoId: 'dobradica', qtd: 1, motivo: 'Se os parafusos já estão firmes e mesmo assim cai, a dobradiça gastou.' },
          { produtoId: 'jogo-chaves-fenda', qtd: 1, motivo: 'Para trocar as dobradiças.', ferramenta: true },
        ];
      return [
        { produtoId: r.local === 'externa' ? 'fechadura-externa' : 'fechadura-interna', qtd: 1, motivo: r.local === 'externa' ? 'Porta da rua pede fechadura com cilindro reforçado.' : 'Fechadura para porta interna.' },
        { produtoId: 'trena-5m', qtd: 1, motivo: 'Meça a distância de broca da fechadura antiga: a nova precisa ser igual.', ferramenta: true, esquecido: true },
        { produtoId: 'jogo-chaves-fenda', qtd: 1, motivo: 'Para soltar a fechadura antiga.', ferramenta: true },
      ];
    },
    nota: (r) => (r.problema === 'caida' ? 'Antes de trocar, tente reapertar os parafusos das dobradiças. Muitas vezes resolve.' : undefined),
    passos: (r) =>
      r.problema === 'range'
        ? ['Abra a porta e borrife o óleo no eixo de cada dobradiça.', 'Abra e feche algumas vezes para espalhar.', 'Limpe o excesso com um pano.']
        : r.problema === 'caida'
          ? ['Calce a porta por baixo para tirar o peso das dobradiças.', 'Troque uma dobradiça de cada vez.', 'Aperte bem os parafusos e retire o calço.']
          : ['Meça a distância de broca da fechadura antiga.', 'Solte os parafusos da testa e das maçanetas.', 'Encaixe a fechadura nova e parafuse.', 'Teste a chave com a porta aberta antes de fechar.'],
  },
  {
    id: 'mofo',
    titulo: 'Mofo na parede',
    resumo: 'Primeiro é preciso matar o mofo; só depois pintar, com tinta antimofo. Pintar por cima sem limpar faz ele voltar.',
    gatilhos: ['mofo', 'bolor', 'parede mofada', 'manchas pretas', 'parede com mofo', 'umidade na parede', 'cheiro de mofo'],
    setor: 'Pintura e acabamento',
    dificuldade: 'Média',
    tempo: '1 dia',
    perguntas: [
      {
        id: 'acao',
        texto: 'Você quer só limpar ou limpar e repintar?',
        opcoes: [
          { valor: 'limpar', rotulo: 'Só limpar', sinais: ['so limpar', 'limpar'] },
          { valor: 'pintar', rotulo: 'Limpar e repintar', sinais: ['pintar', 'repintar'] },
        ],
      },
    ],
    kit: (r) => {
      const itens: ItemKit[] = [
        { produtoId: 'limpador-antimofo', qtd: 1, motivo: 'Mata o mofo e tira as manchas.' },
        { produtoId: 'escova-limpeza', qtd: 1, motivo: 'Para esfregar a parede.' },
        { produtoId: 'luva-borracha', qtd: 1, motivo: 'O produto tem cloro.', esquecido: true },
        { produtoId: 'mascara-pff2', qtd: 1, motivo: 'Evita respirar os esporos do mofo.', esquecido: true },
      ];
      if (r.acao === 'pintar') {
        itens.push({ produtoId: 'tinta-antimofo', qtd: 1, motivo: 'Tem aditivo que impede o mofo de voltar.' });
        itens.push({ produtoId: 'rolo-la-23', qtd: 1, motivo: 'Para pintar por igual.' });
        itens.push({ produtoId: 'bandeja-pintura', qtd: 1, motivo: 'Sem ela não dá para usar o rolo.', esquecido: true });
        itens.push({ produtoId: 'trincha-2', qtd: 1, motivo: 'Para cantos e recortes.' });
      }
      return itens;
    },
    alerta: () => 'Se o mofo volta sempre no mesmo lugar, pode haver infiltração. Nesse caso, a pintura sozinha não resolve.',
    passos: (r) => [
      'Abra janelas e coloque luvas e máscara.',
      'Aplique o limpador na área com mofo e espere o tempo do rótulo.',
      'Esfregue com a escova e deixe secar por completo.',
      ...(r.acao === 'pintar' ? ['Pinte com a tinta antimofo em duas demãos.'] : []),
    ],
  },
  {
    id: 'horta',
    titulo: 'Montar uma horta em vaso',
    resumo: 'Uma horta de temperos cabe numa janela. O que mais faz plantas morrerem é água parada no fundo do vaso.',
    gatilhos: ['horta', 'plantar', 'temperos', 'plantar tempero', 'horta em casa', 'jardim', 'cultivar', 'horta na varanda'],
    setor: 'Jardim e limpeza',
    dificuldade: 'Fácil',
    tempo: '30 min',
    perguntas: [
      {
        id: 'sol',
        texto: 'Onde a horta vai ficar?',
        opcoes: [
          { valor: 'sol', rotulo: 'Varanda ou janela com sol', sinais: ['sol', 'varanda', 'janela'] },
          { valor: 'sombra', rotulo: 'Lugar com pouco sol', sinais: ['sombra', 'pouco sol', 'escuro'] },
        ],
      },
    ],
    kit: () => [
      { produtoId: 'vaso-plastico', qtd: 1, motivo: 'Vaso com furos para a água escoar.' },
      { produtoId: 'argila-expandida', qtd: 1, motivo: 'Camada no fundo que evita raiz encharcada.', esquecido: true },
      { produtoId: 'terra-adubada', qtd: 1, motivo: 'Terra já com adubo.' },
      { produtoId: 'sementes-temperos', qtd: 1, motivo: 'Cebolinha, salsinha e manjericão.' },
      { produtoId: 'regador', qtd: 1, motivo: 'Molha sem encharcar.', ferramenta: true },
    ],
    nota: (r) => (r.sol === 'sombra' ? 'Com pouco sol, cebolinha e salsinha se dão melhor que o manjericão.' : 'Com sol de manhã, os três temperos crescem bem.'),
    passos: () => ['Coloque uns 3 cm de argila expandida no fundo do vaso.', 'Complete com a terra adubada, sem apertar.', 'Espalhe as sementes e cubra com uma camada fina de terra.', 'Regue de leve todos os dias até brotar.'],
  },
  {
    id: 'disjuntor',
    titulo: 'Disjuntor desarmando ou luz caindo',
    resumo: 'Quando o disjuntor desarma, ele está protegendo a casa de uma sobrecarga ou de um curto. Isso pede avaliação de um profissional.',
    gatilhos: ['disjuntor', 'disjuntor desarmando', 'disjuntor caindo', 'cai a luz', 'luz cai', 'quadro de luz', 'desarma', 'chave cai', 'curto circuito'],
    setor: 'Elétrica',
    dificuldade: 'Peça ajuda',
    tempo: 'Avaliação',
    perguntas: [],
    kit: () => [],
    especialista: () => 'Disjuntor que desarma não deve ser trocado por um maior sem avaliar a fiação. Um especialista em Elétrica te orienta sobre o próximo passo e indica o serviço de instalação.',
    alerta: () => 'Não troque o disjuntor por um de amperagem maior para "parar de cair": o fio pode superaquecer.',
    passos: () => [],
  },
];

export const problemaPorId: Record<string, Problema> = Object.fromEntries(PROBLEMAS.map((p) => [p.id, p]));

export function perguntasPendentes(p: Problema, r: Respostas): Pergunta[] {
  return p.perguntas.filter((q) => !(q.id in r) && (!q.quando || q.quando(r)));
}

export function calcularTinta(r: Respostas): { tinta: string; qtd: number; area: number; litros: number; descricao: string } {
  const area = r.tamanho === 'P' ? 30 : r.tamanho === 'G' ? 70 : 45;
  const litros = (area * 2) / (38 / 3.6);
  if (r.umido === 'sim') {
    const g = Math.ceil(litros / 3.6);
    return { tinta: 'tinta-antimofo', qtd: g, area, litros, descricao: `${g} ${g > 1 ? 'galões' : 'galão'} de 3,6 L de tinta antimofo` };
  }
  if (litros > 3 * 3.6) return { tinta: 'tinta-lata-branco', qtd: 1, area, litros, descricao: 'a lata de 18 L sai mais em conta que vários galões' };
  const g = Math.ceil(litros / 3.6);
  return { tinta: 'tinta-galao-branco', qtd: g, area, litros, descricao: `${g} ${g > 1 ? 'galões' : 'galão'} de 3,6 L` };
}
