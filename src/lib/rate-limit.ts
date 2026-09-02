/**
 * Limitador de solicitudes en memoria (token bucket de ventana fija).
 *
 * Sin dependencias y apto para el runtime Edge (solo usa `Map` y `Date`).
 * OJO: el estado vive en la instancia; si el hosting escala a varias instancias
 * cada una lleva su propio conteo. Frena de todos modos a un bot que martilla
 * desde una IP. Para un limite global y exacto, migrar a Upstash Redis / KV.
 */

export interface Regla {
  /** Solicitudes permitidas dentro de la ventana. */
  limite: number;
  /** Duracion de la ventana en milisegundos. */
  ventanaMs: number;
}

export interface Resultado {
  ok: boolean;
  limite: number;
  restantes: number;
  /** Momento (epoch ms) en que se reinicia la ventana. */
  reinicia: number;
  /** Segundos hasta el reinicio; util para la cabecera `Retry-After`. */
  retryAfter: number;
}

interface Registro {
  golpes: number;
  expira: number;
}

const almacen = new Map<string, Registro>();
let contadorGlobal = 0;

/** Borra las entradas vencidas para que el Map no crezca sin limite. */
function purgar(ahora: number): void {
  for (const [clave, registro] of almacen) {
    if (registro.expira <= ahora) almacen.delete(clave);
  }
}

/**
 * Registra un golpe para `clave` bajo `regla` y responde si se permite o no.
 * La ventana se reinicia por completo cuando vence (ventana fija, no deslizante).
 */
export function consumir(clave: string, regla: Regla): Resultado {
  const ahora = Date.now();
  contadorGlobal += 1;
  if (contadorGlobal % 500 === 0) purgar(ahora);

  const actual = almacen.get(clave);

  if (!actual || actual.expira <= ahora) {
    const reinicia = ahora + regla.ventanaMs;
    almacen.set(clave, { golpes: 1, expira: reinicia });
    return { ok: true, limite: regla.limite, restantes: regla.limite - 1, reinicia, retryAfter: 0 };
  }

  actual.golpes += 1;
  const ok = actual.golpes <= regla.limite;
  return {
    ok,
    limite: regla.limite,
    restantes: Math.max(0, regla.limite - actual.golpes),
    reinicia: actual.expira,
    retryAfter: ok ? 0 : Math.max(1, Math.ceil((actual.expira - ahora) / 1000)),
  };
}
