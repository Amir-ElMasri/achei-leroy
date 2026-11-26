import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Headset, X } from 'lucide-react';
import { useApp } from '../lib/store';
import { SETORES, type Setor } from '../data/layout';
import { minutosDesde } from '../lib/armazenamento';
import type { ResumoCaso, Ticket } from '../lib/simulacao';

export function ResumoDoCaso({ resumo }: { resumo: ResumoCaso }) {
  return (
    <dl className="resumo-caso">
      <div>
        <dt>Assunto</dt>
        <dd>{resumo.problema ?? (resumo.ultimaMensagem ? `"${resumo.ultimaMensagem}"` : 'Dúvida geral')}</dd>
      </div>
      {resumo.respostas.length > 0 && (
        <div>
          <dt>O que o cliente já respondeu</dt>
          <dd>
            <ul>
              {resumo.respostas.map((r) => (
                <li key={r.pergunta}>
                  {r.pergunta} <b>{r.resposta}</b>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      )}
      {resumo.itens.length > 0 && (
        <div>
          <dt>Na lista ({resumo.itens.filter((i) => i.coletado).length} de {resumo.itens.length} já pegos)</dt>
          <dd>
            <ul>
              {resumo.itens.map((i) => (
                <li key={i.nome}>
                  {i.coletado ? '✓ ' : ''}
                  {i.nome} <span style={{ color: 'var(--tinta-3)' }}>(corredor {i.corredor})</span>
                  {i.esgotado && <b style={{ color: 'var(--laranja)' }}> esgotado</b>}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      )}
      <div>
        <dt>Onde o cliente está</dt>
        <dd>{resumo.onde}</dd>
      </div>
      {resumo.observacao && (
        <div>
          <dt>Recado do cliente</dt>
          <dd>"{resumo.observacao}"</dd>
        </div>
      )}
    </dl>
  );
}

export function posicaoNaFila(t: Ticket, todos: Ticket[]) {
  return todos.filter((x) => x.lojaId === t.lojaId && x.setor === t.setor && x.status === 'aguardando' && x.criadoEm <= t.criadoEm).length;
}

export function Atendimento() {
  const { meuTicket, tickets, chamarEspecialista, cancelarChamado, encerrarChamado, setorSugerido, resumoAtual, lojaId } = useApp();
  const [setor, setSetor] = useState<Setor>(setorSugerido);
  const [obs, setObs] = useState('');
  const [, tique] = useState(0);

  useEffect(() => setSetor(setorSugerido), [setorSugerido]);
  useEffect(() => {
    const id = setInterval(() => tique((n) => n + 1), 15000);
    return () => clearInterval(id);
  }, []);

  if (meuTicket) {
    const pos = posicaoNaFila(meuTicket, tickets);
    const etapas: { chave: Ticket['status']; titulo: string; detalhe: string }[] = [
      { chave: 'aguardando', titulo: 'Na fila', detalhe: meuTicket.status === 'aguardando' ? `${pos}º da fila de ${meuTicket.setor}, cerca de ${pos * 4} min` : `Chamado feito há ${minutosDesde(meuTicket.criadoEm)} min` },
      { chave: 'a_caminho', titulo: 'Especialista a caminho', detalhe: meuTicket.vendedor ? `${meuTicket.vendedor} está indo até: ${meuTicket.resumo.onde}` : 'Assim que alguém aceitar o seu chamado' },
      { chave: 'em_atendimento', titulo: 'Em atendimento', detalhe: 'O especialista já está com você' },
      { chave: 'concluido', titulo: 'Concluído', detalhe: 'Seu chamado foi encerrado' },
    ];
    const atual = etapas.findIndex((e) => e.chave === meuTicket.status);
    return (
      <div className="conteudo">
        <h1 className="sr">Seu atendimento</h1>
        <section className="senha-painel" aria-live="polite">
          <div className="rotulo">Sua senha</div>
          <div className="senha">{meuTicket.senha}</div>
          <div>
            {meuTicket.status === 'aguardando' && `Especialista de ${meuTicket.setor}. Pode continuar suas compras: avisamos aqui quando alguém estiver a caminho.`}
            {meuTicket.status === 'a_caminho' && `${meuTicket.vendedor} já recebeu o seu caso e está indo até você.`}
            {meuTicket.status === 'em_atendimento' && `Em atendimento com ${meuTicket.vendedor}.`}
            {meuTicket.status === 'concluido' && 'Atendimento concluído. Obrigado!'}
          </div>
        </section>

        <ol className="linha-tempo">
          {etapas.map((e, i) => (
            <li key={e.chave} className={i < atual || meuTicket.status === 'concluido' ? 'feito' : i === atual ? 'agora' : ''}>
              <span className="marco">{(i < atual || meuTicket.status === 'concluido') && <Check size={16} strokeWidth={3} />}</span>
              <span>
                <b>{e.titulo}</b>
                <small>{e.detalhe}</small>
              </span>
            </li>
          ))}
        </ol>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {meuTicket.status === 'concluido' ? (
            <button className="btn btn-primario" onClick={encerrarChamado}>
              Fechar
            </button>
          ) : (
            <>
              <button className="btn btn-primario" onClick={encerrarChamado}>
                <Check size={18} /> Já fui atendido
              </button>
              <button className="btn btn-secundario" onClick={cancelarChamado}>
                <X size={18} /> Cancelar chamado
              </button>
            </>
          )}
        </div>

        <section className="bloco">
          <h2>O que o especialista recebeu</h2>
          <ResumoDoCaso resumo={meuTicket.resumo} />
        </section>
        <p style={{ fontSize: 13.5, color: 'var(--tinta-3)', marginTop: 12 }}>
          Para ver o outro lado, abra a <Link to="/painel">área da loja</Link> em outra aba: o chamado aparece lá na hora.
        </p>
      </div>
    );
  }

  const naFila = tickets.filter((t) => t.lojaId === lojaId && t.setor === setor && t.status === 'aguardando').length;
  const resumo = resumoAtual(obs);

  return (
    <div className="conteudo">
      <div className="cabecalho-pagina">
        <div>
          <h1>Falar com um especialista</h1>
          <p>Ele vem até você e já chega sabendo do seu caso. Você não precisa explicar tudo de novo.</p>
        </div>
      </div>

      <section className="bloco" style={{ marginTop: 0 }}>
        <div className="campo" style={{ marginTop: 0 }}>
          <label htmlFor="setor">Especialista de</label>
          <select id="setor" value={setor} onChange={(e) => setSetor(e.target.value as Setor)}>
            {SETORES.map((s) => (
              <option key={s.nome} value={s.nome}>
                {s.nome}
              </option>
            ))}
          </select>
          <small style={{ color: 'var(--tinta-2)' }}>
            {naFila === 0 ? 'Ninguém na fila agora.' : `${naFila} ${naFila === 1 ? 'pessoa' : 'pessoas'} na fila, espera estimada de ${(naFila + 1) * 4} min.`}
          </small>
        </div>
        <div className="campo">
          <label htmlFor="obs">Quer acrescentar algo? (opcional)</label>
          <textarea id="obs" rows={2} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex.: a torneira é de parede e bem antiga" />
        </div>
        <button className="btn btn-primario btn-bloco" style={{ marginTop: 14 }} onClick={() => chamarEspecialista(setor, obs)}>
          <Headset size={20} /> Chamar especialista
        </button>
      </section>

      <section className="bloco">
        <h2>O especialista vai receber</h2>
        <ResumoDoCaso resumo={resumo} />
      </section>
    </div>
  );
}
