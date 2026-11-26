import { NIVEIS } from '../data/layout';

/**
 * Vista de frente da prateleira (o "último metro"): mostra os 12 módulos do lado do corredor
 * e as 5 alturas, com o lugar exato do produto em destaque.
 */
export function Gondola({ lado, modulo, nivel, claro = false }: { lado: 'E' | 'D'; modulo: number; nivel: number; claro?: boolean }) {
  const W = 300;
  const H = 120;
  const x0 = 6;
  const larg = (W - 12 - 14) / 12; // 14 px de vão no corredor transversal
  const alt = 18;
  const y0 = 8;
  const corPrat = claro ? '#9aa69f' : 'rgba(255,255,255,0.35)';
  const corTexto = claro ? '#4b5751' : 'rgba(255,255,255,0.75)';
  const xMod = (m: number) => x0 + (m - 1) * larg + (m > 6 ? 14 : 0);
  const yNiv = (n: number) => y0 + (5 - n) * alt;
  return (
    <div className={`gondola${claro ? ' claro' : ''}`}>
      <div className="gondola-titulo">
        Lado {lado === 'E' ? 'esquerdo' : 'direito'} do corredor, olhando da entrada para o fundo
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Módulo ${modulo}, prateleira ${nivel} de 5, ${NIVEIS[nivel]}`}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) =>
          [1, 2, 3, 4, 5].map((n) => {
            const alvo = m === modulo && n === nivel;
            return (
              <rect
                key={`${m}-${n}`}
                x={xMod(m) + 1}
                y={yNiv(n) + 1}
                width={larg - 2}
                height={alt - 3}
                rx={2}
                fill={alvo ? '#FFC41F' : 'transparent'}
                stroke={alvo ? '#FFC41F' : corPrat}
                strokeWidth={alvo ? 2 : 1}
              />
            );
          }),
        )}
        <text x={xMod(1)} y={H - 2} fontSize="10" fill={corTexto} fontFamily="Barlow, sans-serif">
          ← entrada
        </text>
        <text x={W - 6} y={H - 2} fontSize="10" fill={corTexto} textAnchor="end" fontFamily="Barlow, sans-serif">
          fundo da loja →
        </text>
        <text x={xMod(modulo) + larg / 2} y={y0 + 5 * alt + 11} fontSize="10" fontWeight="700" fill={claro ? '#17201b' : '#FFC41F'} textAnchor="middle" fontFamily="Barlow, sans-serif">
          {modulo}
        </text>
      </svg>
    </div>
  );
}
