# Achei — assistente de loja com IA

Projeto do **Challenge FIAP 2026 (Engenharia de Software, 2º ano)** para a **Leroy Merlin**.
Desafio: *otimizar a jornada do cliente na loja física com IA, facilitando a localização de produtos e o autoatendimento.*

**Equipe:** Amir Adel Camilo El Masri (RM 566123), Caio Corrêa Morais (RM 564218) e Yuri Assis Zakabi (RM 564416).

---

## A ideia em uma frase

O cliente conta o **problema** do jeito dele ("a descarga não para de correr água") e o Achei devolve o **kit completo**, a **prateleira exata** de cada item e a **rota mais curta** pela loja. Se ainda precisar de alguém, o **especialista já chega sabendo do caso**.

## Como o MVP ataca cada dor do desafio

| Dor apresentada no kickoff | O que o Achei faz |
|---|---|
| **Assimetria de informação** (o cliente não sabe o que procurar) | O assistente entende linguagem leiga, faz as perguntas que um vendedor faria (voltagem, tipo de parede, tamanho do cômodo) e monta o kit. Calcula a quantidade de tinta. |
| **Problema do "último metro"** (achar o produto exato numa loja de 10.000 m²) | Corredor, lado, módulo e **altura da prateleira** de cada item, com a vista de frente da gôndola e o ponto marcado no mapa. |
| **Tempo perdido / loja grande** | Rota otimizada passando por todos os itens até os caixas, com distância, tempo e quantos metros foram poupados. |
| **Inércia do suporte / linguagem técnica** | Tradutor técnico: toque em "2P+T", "1/2"", "6500 K" e veja a explicação simples. |
| **Pico de clientes / mais clientes que vendedores** | Fila digital por setor. O vendedor recebe o resumo do caso (problema, respostas, itens já pegos e onde o cliente está) e vai até o corredor. |
| **Inconsistência na jornada (gama, promessa)** | Estoque por loja: item esgotado é trocado por um equivalente e fica fora da rota; o app mostra em que outra loja há estoque. |

### O "pulo do gato"
1. **Do problema ao carrinho em uma viagem:** o kit inclui o que quase todo mundo esquece (veda-rosca, bandeja de pintura, chave de teste) — o motivo número um de voltar à loja.
2. **O especialista nunca começa do zero:** o atendimento humano recebe o caso já diagnosticado.
3. **A loja aprende com cada pergunta:** o painel mostra o que os clientes procuram e não encontram, rupturas percebidas, horários de pico e setores mais chamados.

## Funcionalidades

**App do cliente** (pensado para o celular, também funciona no computador)
- Assistente por **texto, voz** (reconhecimento de fala do navegador) **ou foto** (com a IA de visão ligada)
- Diagnóstico com perguntas em botões; respostas que o cliente já deu no texto são aproveitadas ("chuveiro 220" já responde a voltagem)
- Kit completo com preço, estoque, motivo de cada item, alertas de segurança e passo a passo para fazer em casa
- Lista com "peguei", "já tenho em casa", quantidade e troca de itens esgotados
- Mapa da loja com a sua posição, paradas numeradas e caminho animado; próxima parada com a gôndola desenhada
- Página do produto com localização, ficha técnica traduzida e "costuma ir junto"
- Chamado de especialista com senha e acompanhamento em tempo real

**Área da loja** (`/#/painel`)
- Fila de atendimento com o resumo de cada caso e as ações *aceitar → cheguei → concluir*
- Indicadores: perguntas, % entendidas pela IA, % resolvidas sem especialista, caminhada poupada, problemas mais trazidos, termos sem produto, rupturas, movimento por hora e chamados por setor

## Como a IA funciona

| Camada | O que faz | Onde está |
|---|---|---|
| **IA generativa (Gemini)** | Interpreta a mensagem e fotos, liga ao catálogo, extrai respostas já dadas. Responde em JSON validado contra o catálogo (não inventa produto). | `api/assistente.js`, `api/identificar.js` |
| **Motor local de linguagem** | Normalização, sinônimos, radicais, tolerância a erro de digitação (Levenshtein) e ranqueamento TF-IDF. Funciona sem internet e sem chave. | `src/lib/nlp.ts` |
| **Rota** | Planta em grade de 1 m, Dijkstra entre todos os pontos e ordem ótima (Held-Karp até 10 paradas; vizinho mais próximo + 2-opt acima). | `src/lib/rota.ts` |

Se a chave do Gemini não estiver configurada, ou a chamada falhar, o motor local responde. O selo no topo mostra qual está ativo (**IA Gemini** ou **IA local**).

## Tecnologias

React 18 + TypeScript + Vite, React Router, lucide-react (ícones). Funções serverless da Vercel (Node) para a IA. Sem banco de dados: o estado fica no `localStorage`, e as abas do mesmo navegador se comunicam (o painel do vendedor numa aba vê o chamado feito na outra).

> O regulamento permite usar outras tecnologias na construção do MVP para a Leroy Merlin.

## Rodar no computador

```bash
npm install
npm run dev
```

Abra o endereço que aparecer (normalmente http://localhost:5173). Nesse modo, a IA roda no **motor local**. Para testar também as funções do Gemini localmente: `npx vercel dev`.

## Testes

```bash
npm test
```

São 216 testes automáticos (Vitest), em 4 arquivos:

| Arquivo | O que garante |
|---|---|
| `tests/catalogo.test.ts` | Todo produto tem posição, preço e textos válidos; dois produtos não dividem a mesma prateleira; todo termo técnico tem explicação; **todos os 14 problemas geram um kit válido em todas as combinações de resposta** |
| `tests/nlp.test.ts` | O assistente entende 84 frases reais de cliente (com erro de digitação, sem acento, gíria), aproveita o que o cliente já disse e entende respostas digitadas |
| `tests/rota.test.ts` | Toda prateleira é alcançável, o caminho nunca atravessa gôndola e a ordem das paradas é a melhor possível (comparada com força bruta) |
| `tests/api.test.ts` | As funções da IA respondem certo, trocam de modelo se preciso, nunca expõem a chave e falham de forma segura |

Além disso, o app foi auditado num navegador real em 4 tamanhos de tela (320 px, 390 px, 768 px e 1366 px), em 28 estados diferentes de cada tela. A auditoria checou contraste de cores (WCAG AA, com axe-core), texto digitado visível, rolagem lateral, zoom indesejado no iPhone, área de toque e conteúdo escondido atrás das barras fixas. Também passaram 17 fluxos completos de ponta a ponta, entre eles: chamado aceito no painel em outra aba, item esgotado, armazenamento bloqueado, IA fora do ar e QR code.

## Publicar na Vercel

1. Suba esta pasta para um repositório no GitHub.
2. Em vercel.com: **Add New → Project → Import** o repositório → **Deploy**. A Vercel detecta o Vite sozinha.
3. *(Opcional, liga texto e foto com Gemini)* Crie uma chave em https://aistudio.google.com/apikey. Na Vercel: **Settings → Environment Variables** → `GEMINI_API_KEY` = sua chave → **Deployments → Redeploy**.

## Roteiro sugerido para o vídeo (até 3 min)

1. **0:00–0:25** — O problema: loja de 10.000 m², cliente com uma torneira pingando, sem saber o nome da peça, vendedores ocupados.
2. **0:25–1:10** — No celular: "minha torneira está pingando" → duas perguntas → kit com veda-rosca ("muita gente esquece") → adicionar à lista.
3. **1:10–1:45** — Rota: mapa, metros poupados, próxima parada com a gôndola e a altura da prateleira; tocar em "Peguei".
4. **1:45–2:15** — "Quero pintar o quarto": cálculo de tinta e troca automática do item esgotado.
5. **2:15–2:45** — Chamar especialista em uma aba e, na outra, o painel recebendo o caso resumido; aba de indicadores.
6. **2:45–3:00** — Próximos passos: integração com o estoque real, planograma e QR codes nas placas dos corredores.

## Próximos passos (escalabilidade)

- Trocar os dados simulados pelas APIs reais de **estoque** e **planograma** (os pontos de integração são `estoqueInicial` em `src/lib/store.tsx` e `src/data/produtos.ts`)
- Posição do cliente por **QR code nas placas de corredor** (já suportado: `?corredor=9`) ou beacons
- QR code na entrada que já abre a loja certa (já suportado: `?loja=zona-sul`)
- Fila e indicadores em um backend compartilhado entre os aparelhos da loja
- Busca semântica com embeddings sobre o catálogo completo

---

*Protótipo acadêmico. Lojas, preços, estoques e planta são fictícios e não representam dados reais da Leroy Merlin.*
