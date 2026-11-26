import { useState, type CSSProperties } from 'react';
import {
  Wrench, Drill, Nut, DoorOpen, Plug, Cable, Lightbulb, LampCeiling, Droplet, Droplets, ShowerHead, Bath, CookingPot, PaintBucket, PaintRoller, Sprout,
  type LucideIcon,
} from 'lucide-react';
import { corSetor, departamento } from '../data/layout';
import { GLOSSARIO, type Produto } from '../data/produtos';
import type { StatusIA } from '../lib/ia';

const ICONES: Record<number, LucideIcon> = {
  1: Wrench, 2: Drill, 3: Nut, 4: DoorOpen, 5: Plug, 6: Cable, 7: Lightbulb, 8: LampCeiling,
  9: Droplet, 10: Droplets, 11: ShowerHead, 12: Bath, 13: CookingPot, 14: PaintBucket, 15: PaintRoller, 16: Sprout,
};

export const corDoCorredor = (c: number) => corSetor(departamento(c).setor);

/** Placa de corredor, como as penduradas no teto da loja */
export function PlacaCorredor({ corredor, tamanho = 'p', titulo }: { corredor: number; tamanho?: 'p' | 'g'; titulo?: string }) {
  return (
    <span className={`placa ${tamanho}`} style={{ '--placa-cor': corDoCorredor(corredor) } as CSSProperties} title={titulo ?? `Corredor ${corredor}: ${departamento(corredor).nome}`}>
      <span className="placa-rotulo">Corredor</span>
      <span className="placa-num">{corredor}</span>
    </span>
  );
}

export function IconeProduto({ produto, tamanho = 22 }: { produto: Produto; tamanho?: number }) {
  const Icone = ICONES[produto.corredor] ?? Wrench;
  return (
    <span className="ico-prod" style={{ background: corDoCorredor(produto.corredor) }} aria-hidden>
      <Icone size={tamanho} strokeWidth={2} />
    </span>
  );
}

export function StatusEstoque({ qtd, unidade }: { qtd: number; unidade?: string }) {
  if (qtd <= 0) return <span className="estoque zero">Esgotado nesta loja</span>;
  if (qtd <= 5) return <span className="estoque baixo">Últimas {qtd} {unidade === 'm' ? 'm' : 'un.'}</span>;
  return (
    <span className="estoque ok">
      {qtd} {unidade === 'm' ? 'm' : 'un.'} na loja
    </span>
  );
}

/** Termo técnico com explicação em palavras simples (tradutor técnico) */
export function Termo({ chave, children }: { chave: string; children: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const g = GLOSSARIO[chave];
  if (!g) return <>{children}</>;
  return (
    <>
      <button type="button" className="termo" aria-expanded={aberto} onClick={() => setAberto((a) => !a)}>
        {children}
      </button>
      {aberto && (
        <div className="termo-explica" role="note">
          <b>{g.termo}:</b> {g.explica}
        </div>
      )}
    </>
  );
}

export function SeloIA({ status }: { status: StatusIA }) {
  const texto = status === 'gemini' ? 'IA Gemini' : status === 'local' ? 'IA local' : 'IA…';
  const dica =
    status === 'gemini'
      ? 'IA generativa (Gemini) conectada para entender textos e fotos'
      : 'Motor de linguagem local: entende textos sem internet. Conecte o Gemini para reconhecer fotos.';
  return (
    <span className="selo-ia" data-ia={status} title={dica}>
      <span className="ponto" />
      {texto}
    </span>
  );
}
