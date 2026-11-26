import { useRef } from 'react';
import {
  LOJA_W, LOJA_H, NUM_CORREDORES, xGondola, xCorredor, GONDOLA_FRENTE, GONDOLA_FUNDO, BALCOES_CAIXA, BALCAO_ATENDIMENTO, ENTRADA, CAIXAS, departamento, corSetor, type Ponto,
} from '../data/layout';

export interface MarcadorParada {
  chave: string;
  ponto: Ponto;
  numero: number;
  feita: boolean;
  atual: boolean;
}

interface Props {
  paradas?: MarcadorParada[];
  trechos?: Ponto[][];
  /** índice do trecho que leva à próxima parada */
  trechoAtual?: number;
  voce: Ponto;
  destaque?: Ponto | null;
  aoTocar?: (p: Ponto) => void;
}

const caminhoSVG = (pts: Ponto[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');

export function MapaLoja({ paradas = [], trechos = [], trechoAtual = 0, voce, destaque, aoTocar }: Props) {
  const ref = useRef<SVGSVGElement>(null);

  const tocar = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!aoTocar || !ref.current) return;
    const pt = ref.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = ref.current.getScreenCTM();
    if (!m) return;
    const p = pt.matrixTransform(m.inverse());
    aoTocar({ x: p.x, y: p.y });
  };

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${LOJA_W} ${LOJA_H}`}
      role="img"
      aria-label="Planta da loja com a sua posição e a rota até os produtos"
      onClick={tocar}
      style={{ cursor: aoTocar ? 'crosshair' : 'default', fontFamily: 'Barlow, sans-serif' }}
    >
      {/* piso e paredes */}
      <rect x={2} y={2} width={96} height={96} fill="#fbfcfa" stroke="#9aa69f" strokeWidth={0.6} rx={1} />
      <rect x={44} y={97.4} width={12} height={1.4} fill="#fbfcfa" />

      {/* faixa colorida no chão de cada corredor, pela cor do setor */}
      {Array.from({ length: NUM_CORREDORES }, (_, i) => i + 1).map((k) => (
        <g key={`c${k}`}>
          <rect x={xCorredor(k) - 1.5} y={GONDOLA_FUNDO.y0} width={3} height={GONDOLA_FRENTE.y1 - GONDOLA_FUNDO.y0} fill={corSetor(departamento(k).setor)} opacity={0.1} />
        </g>
      ))}

      {/* gôndolas */}
      {Array.from({ length: NUM_CORREDORES + 1 }, (_, i) => (
        <g key={`g${i}`}>
          <rect x={xGondola(i)} y={GONDOLA_FUNDO.y0} width={2} height={GONDOLA_FUNDO.y1 - GONDOLA_FUNDO.y0} fill="#b9c3bd" rx={0.3} />
          <rect x={xGondola(i)} y={GONDOLA_FRENTE.y0} width={2} height={GONDOLA_FRENTE.y1 - GONDOLA_FRENTE.y0} fill="#b9c3bd" rx={0.3} />
        </g>
      ))}

      {/* placas com o número dos corredores (frente e meio) */}
      {Array.from({ length: NUM_CORREDORES }, (_, i) => i + 1).map((k) => (
        <g key={`n${k}`}>
          {[80.2, 44.3].map((y) => (
            <g key={y}>
              <rect x={xCorredor(k) - 1.7} y={y} width={3.4} height={3.4} rx={0.5} fill={corSetor(departamento(k).setor)} />
              <rect x={xCorredor(k) - 1.7} y={y} width={3.4} height={0.55} fill="#FFC41F" />
              <text x={xCorredor(k)} y={y + 2.9} fontSize={2.3} fontWeight={800} fill="#fff" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif">
                {k}
              </text>
            </g>
          ))}
        </g>
      ))}

      {/* caixas e atendimento */}
      {BALCOES_CAIXA.map((b, i) => (
        <rect key={`cx${i}`} x={b.x} y={b.y} width={b.w} height={b.h} fill="#77837c" rx={0.4} />
      ))}
      <text x={24.5} y={97} fontSize={2.4} fill="#4b5751" textAnchor="middle" fontWeight={600}>
        Caixas
      </text>
      <rect x={BALCAO_ATENDIMENTO.x} y={BALCAO_ATENDIMENTO.y} width={BALCAO_ATENDIMENTO.w} height={BALCAO_ATENDIMENTO.h} fill="#0F7B45" opacity={0.85} rx={0.6} />
      <text x={BALCAO_ATENDIMENTO.x + BALCAO_ATENDIMENTO.w / 2} y={BALCAO_ATENDIMENTO.y + 3.3} fontSize={2.3} fill="#fff" textAnchor="middle" fontWeight={600}>
        Atendimento
      </text>
      <text x={ENTRADA.x} y={99.6} fontSize={2.2} fill="#4b5751" textAnchor="middle" fontWeight={700}>
        Entrada
      </text>
      <text x={50} y={8.6} fontSize={2.3} fill="#77837c" textAnchor="middle">
        Fundo da loja
      </text>

      {/* rota */}
      {trechos.map((t, i) => (
        <path
          key={`t${i}`}
          d={caminhoSVG(t)}
          fill="none"
          stroke={i < trechoAtual ? '#b9c3bd' : '#17201b'}
          strokeWidth={i === trechoAtual ? 0.9 : 0.55}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={i === trechoAtual ? 'trajeto' : undefined}
          opacity={i > trechoAtual ? 0.45 : 1}
        />
      ))}

      {/* fim da rota nos caixas */}
      {trechos.length > 0 && <circle cx={CAIXAS.x} cy={CAIXAS.y} r={1.1} fill="#fff" stroke="#17201b" strokeWidth={0.5} />}

      {/* paradas */}
      {paradas.map((p) => (
        <g key={p.chave}>
          {p.atual && <circle cx={p.ponto.x} cy={p.ponto.y} r={3} fill="#FFC41F" opacity={0.55} />}
          <rect x={p.ponto.x - 1.6} y={p.ponto.y - 1.6} width={3.2} height={3.2} rx={0.6} fill={p.feita ? '#0F7B45' : '#17201b'} />
          <text x={p.ponto.x} y={p.ponto.y + 0.85} fontSize={2.3} fontWeight={800} fill="#fff" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif">
            {p.feita ? '✓' : p.numero}
          </text>
        </g>
      ))}

      {destaque && (
        <g>
          <circle cx={destaque.x} cy={destaque.y} r={3.2} fill="#FFC41F" opacity={0.55} />
          <circle cx={destaque.x} cy={destaque.y} r={1.4} fill="#17201b" />
        </g>
      )}

      {/* você está aqui */}
      <g>
        <circle cx={voce.x} cy={voce.y} r={2.6} fill="#FFC41F" opacity={0.35}>
          <animate attributeName="r" values="1.8;3.4;1.8" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx={voce.x} cy={voce.y} r={1.4} fill="#FFC41F" stroke="#17201b" strokeWidth={0.5} />
      </g>
    </svg>
  );
}
