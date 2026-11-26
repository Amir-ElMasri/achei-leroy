import { Link, useNavigate } from 'react-router-dom';
import { Droplet, ShowerHead, PaintRoller, Hammer, Droplets, Plug, DoorOpen, SprayCan, MapPin, ListChecks, Headset, ChevronRight, Search } from 'lucide-react';
import { useApp } from '../lib/store';
import { lojaPorId } from '../data/lojas';
import { EntradaPergunta } from '../components/EntradaPergunta';

const PROBLEMAS_COMUNS = [
  { texto: 'Minha torneira está pingando', rotulo: 'Torneira pingando', Icone: Droplet },
  { texto: 'O chuveiro não esquenta', rotulo: 'Chuveiro não esquenta', Icone: ShowerHead },
  { texto: 'Quero pintar um quarto', rotulo: 'Pintar um quarto', Icone: PaintRoller },
  { texto: 'Quero pendurar uma prateleira', rotulo: 'Pendurar prateleira', Icone: Hammer },
  { texto: 'A pia está entupida', rotulo: 'Pia entupida', Icone: Droplets },
  { texto: 'Preciso trocar uma tomada', rotulo: 'Trocar tomada', Icone: Plug },
  { texto: 'A porta está rangendo', rotulo: 'Porta rangendo', Icone: DoorOpen },
  { texto: 'Tem mofo na parede', rotulo: 'Mofo na parede', Icone: SprayCan },
];

const PRODUTOS_RAPIDOS = ['fita veda-rosca', 'bucha 6', 'lâmpada LED', 'fita crepe', 'chave de teste'];

export function Inicio() {
  const { perguntar, enviarFoto, lojaId, lista, tickets, meuTicket, ocupado } = useApp();
  const navegar = useNavigate();
  const loja = lojaPorId(lojaId);
  const pendentes = lista.filter((i) => !i.coletado && !i.jaTenho).length;
  const naFila = tickets.filter((t) => t.lojaId === lojaId && t.status === 'aguardando').length;

  const ir = (texto: string) => {
    navegar('/assistente');
    perguntar(texto);
  };

  return (
    <div className="conteudo">
      <section className="inicio-hero">
        <span className="onde">
          <MapPin size={16} /> Você está na {loja.nome}
        </span>
        <h1>O que você precisa resolver hoje?</h1>
        <p>Conte do seu jeito, por texto, voz ou foto. Eu digo o que levar, em que prateleira está cada item e o caminho mais curto até ele.</p>
        <EntradaPergunta
          aoEnviar={ir}
          aoFoto={(f) => {
            navegar('/assistente');
            enviarFoto(f);
          }}
          desativado={ocupado}
          autoFoco
        />
      </section>

      {(pendentes > 0 || meuTicket) && (
        <div className="faixa-status">
          {pendentes > 0 && (
            <Link to="/rota" className="status-link">
              <span className="ico">
                <ListChecks size={22} />
              </span>
              <span>
                <b>Continuar a rota</b>
                <small>
                  {pendentes} {pendentes === 1 ? 'item falta' : 'itens faltam'} na sua lista
                </small>
              </span>
              <ChevronRight className="seta" size={20} />
            </Link>
          )}
          {meuTicket && (
            <Link to="/atendimento" className="status-link">
              <span className="ico">
                <Headset size={22} />
              </span>
              <span>
                <b>Senha {meuTicket.senha}</b>
                <small>Acompanhe o seu atendimento</small>
              </span>
              <ChevronRight className="seta" size={20} />
            </Link>
          )}
        </div>
      )}

      <section className="secao">
        <h2>Problemas que mais chegam à loja</h2>
        <div className="chips">
          {PROBLEMAS_COMUNS.map(({ texto, rotulo, Icone }) => (
            <button key={rotulo} className="chip" onClick={() => ir(texto)}>
              <Icone size={17} />
              {rotulo}
            </button>
          ))}
        </div>
      </section>

      <section className="secao">
        <h2>Já sabe o produto?</h2>
        <div className="chips">
          {PRODUTOS_RAPIDOS.map((p) => (
            <button key={p} className="chip" onClick={() => ir(`Onde fica ${p}?`)}>
              <Search size={16} />
              {p}
            </button>
          ))}
        </div>
      </section>

      <section className="secao">
        <h2>Como funciona</h2>
        <ol className="passos-como">
          <li>
            <span>
              <b>Conte o problema, não o nome técnico</b>
              <span>"A descarga não para de correr água" já basta. Eu faço as perguntas que um vendedor faria.</span>
            </span>
          </li>
          <li>
            <span>
              <b>Receba o kit completo</b>
              <span>Inclusive os itens que quase todo mundo esquece, com preço e estoque desta loja.</span>
            </span>
          </li>
          <li>
            <span>
              <b>Siga a rota até a prateleira</b>
              <span>Corredor, lado, módulo e altura de cada item, na ordem que faz você andar menos.</span>
            </span>
          </li>
          <li>
            <span>
              <b>Precisa de alguém? O especialista já chega sabendo</b>
              <span>
                {naFila === 0 ? 'Fila vazia agora.' : `${naFila} ${naFila === 1 ? 'pessoa' : 'pessoas'} na fila agora.`} Ele recebe o resumo do seu caso e vai até o corredor onde você está.
              </span>
            </span>
          </li>
        </ol>
      </section>

      <footer className="rodape">
        <span>Protótipo acadêmico do Challenge FIAP 2026 para a Leroy Merlin. Lojas, preços, estoques e planta são simulados.</span>
        <span>Equipe: Amir El Masri, Caio Corrêa Morais e Yuri Assis Zakabi (Engenharia de Software, 2º ano).</span>
        <Link to="/painel">Área da loja: painel dos vendedores e indicadores</Link>
      </footer>
    </div>
  );
}
