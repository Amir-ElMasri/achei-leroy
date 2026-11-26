// Acesso seguro ao localStorage (pode falhar em aba anônima ou com dados bloqueados).

export const CHAVES = {
  cliente: 'achei:v1:cliente',
  tickets: 'achei:v1:tickets',
  eventos: 'achei:v1:eventos',
  painel: 'achei:v1:painel-ativo',
} as const;

export function ler<T>(chave: string, padrao: T): T {
  try {
    const v = localStorage.getItem(chave);
    return v ? (JSON.parse(v) as T) : padrao;
  } catch {
    return padrao;
  }
}

export function gravar(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* sem armazenamento: o app segue funcionando só em memória */
  }
}

export const moeda = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function minutosDesde(t: number, agora = Date.now()) {
  return Math.max(0, Math.round((agora - t) / 60000));
}
