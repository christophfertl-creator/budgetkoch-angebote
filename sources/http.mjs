/** Höfliches Abrufen: eindeutiger User-Agent, Pause zwischen Anfragen, ein Wiederholungsversuch. */
const UA = 'BudgetKoch-Angebotsimport/0.1 (Prototyp; woechentlich; kontakt: christophfertl@me.com)';
const PAUSE_MS = 1500;

let last = 0;
export async function politeFetch(url, init = {}) {
  const wait = last + PAUSE_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  for (let attempt = 0; ; attempt++) {
    last = Date.now();
    const res = await fetch(url, { ...init, headers: { 'user-agent': UA, accept: '*/*', ...init.headers } });
    if (res.ok || attempt >= 1) return res;
    await new Promise((r) => setTimeout(r, 5000));
  }
}
