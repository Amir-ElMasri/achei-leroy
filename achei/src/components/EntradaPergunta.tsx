import { useEffect, useRef, useState } from 'react';
import { Camera, Mic, SendHorizontal } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Reconhecimento = any;

function criarReconhecimento(): Reconhecimento | null {
  const w = window as unknown as { SpeechRecognition?: new () => Reconhecimento; webkitSpeechRecognition?: new () => Reconhecimento };
  const C = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!C) return null;
  const r = new C();
  r.lang = 'pt-BR';
  r.interimResults = true;
  r.maxAlternatives = 1;
  return r;
}

interface Props {
  aoEnviar: (texto: string) => void;
  /** texto de exemplo para telas estreitas (até 400 px) */
  placeholderCurto?: string;
  aoFoto?: (arquivo: File) => void;
  desativado?: boolean;
  placeholder?: string;
  autoFoco?: boolean;
}

export function EntradaPergunta({ aoEnviar, aoFoto, desativado, placeholder = 'Ex.: minha torneira está pingando', placeholderCurto, autoFoco }: Props) {
  const [texto, setTexto] = useState('');
  const [estreito, setEstreito] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 400px)').matches);
  const [ouvindo, setOuvindo] = useState(false);
  const [temVoz, setTemVoz] = useState(false);
  const rec = useRef<Reconhecimento | null>(null);
  const arquivo = useRef<HTMLInputElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 400px)');
    const ouvir = () => setEstreito(mq.matches);
    mq.addEventListener?.('change', ouvir);
    return () => mq.removeEventListener?.('change', ouvir);
  }, []);

  useEffect(() => {
    setTemVoz(!!criarReconhecimento());
    if (autoFoco && window.matchMedia('(min-width: 960px)').matches) area.current?.focus();
  }, [autoFoco]);

  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [texto, estreito]);

  const enviar = (t = texto) => {
    if (!t.trim() || desativado) return;
    aoEnviar(t.trim());
    setTexto('');
  };

  const falar = () => {
    if (ouvindo) {
      rec.current?.stop();
      return;
    }
    const r = criarReconhecimento();
    if (!r) return;
    rec.current = r;
    let final = '';
    r.onresult = (e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => {
      let parcial = '';
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) final = res[0].transcript;
        else parcial += res[0].transcript;
      }
      setTexto(final || parcial);
    };
    r.onend = () => {
      setOuvindo(false);
      if (final) enviar(final);
    };
    r.onerror = () => setOuvindo(false);
    setOuvindo(true);
    r.start();
  };

  return (
    <form
      className="pergunta-caixa"
      onSubmit={(e) => {
        e.preventDefault();
        enviar();
      }}
    >
      {aoFoto && (
        <>
          <button type="button" className="icone-btn" aria-label="Enviar foto da peça ou do problema" title="Foto da peça ou do problema" onClick={() => arquivo.current?.click()} disabled={desativado}>
            <Camera size={20} />
          </button>
          <input
            ref={arquivo}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) aoFoto(f);
              e.target.value = '';
            }}
          />
        </>
      )}
      <label className="sr" htmlFor="pergunta">
        O que você precisa resolver?
      </label>
      <textarea
        id="pergunta"
        ref={area}
        rows={1}
        value={texto}
        placeholder={ouvindo ? 'Pode falar…' : estreito && placeholderCurto ? placeholderCurto : placeholder}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviar();
          }
        }}
      />
      {temVoz && (
        <button type="button" className={`icone-btn${ouvindo ? ' ouvindo' : ''}`} aria-label={ouvindo ? 'Parar de ouvir' : 'Falar em vez de digitar'} title="Falar" onClick={falar} disabled={desativado}>
          <Mic size={20} />
        </button>
      )}
      <button type="submit" className="enviar" aria-label="Enviar" disabled={!texto.trim() || desativado}>
        <SendHorizontal size={20} />
      </button>
    </form>
  );
}
