// Self-contained strings for the admin tool. The admin area lives outside
// app/[locale] and is excluded from next-intl routing (see proxy.ts), so it
// doesn't share the public site's message files or locale URLs. Instead the
// selected language is kept in a plain `admin_lang` cookie and the matching
// dictionary is picked server-side, then handed to the client forms as props.
//
// Keep this file free of server-only imports (no next/headers): the client
// forms import the *types* from here, and pulling in a server module would
// break their build.

export type AdminLang = "en" | "es";

export const ADMIN_LANG_COOKIE = "admin_lang";

export const adminDict = {
  en: {
    toggleAria: "Language",
    notConfigured: {
      title: "Admin not configured",
      set: "Set",
      and: "and",
      plus: "(plus",
      tail: ") in your environment, then reload.",
    },
    page: {
      adminTitle: "Milkweed admin",
      title: "Official milkweed pins",
      intro:
        "Milkweed planted by Claudia or with Women for Green Spaces. These show on the public map with the green pod marker, at their exact location — so only add public sites like gardens, schools and parks, never someone's home.",
      existing: "Existing pins",
      none: "No official pins yet — add the first one above.",
      unpublished: "unpublished",
      milkweedUnit: "milkweed",
      countUnrecorded: "Count not recorded",
      tableHint1: "To edit or remove a pin, open",
      tableHint2: "in the Supabase Table Editor — set",
      tableHint3: "to false to hide one from the map without deleting it.",
    },
    submissions: {
      heading: "Community submissions",
      intro:
        "Plants people added from the public form. Approving shows a butterfly pin on the map (the exact location is already blurred for privacy). Rejecting hides it.",
      none: "Nothing waiting for review — you're all caught up.",
      noName: "Anonymous",
      approve: "Approve",
      reject: "Reject",
      approving: "Approving…",
      rejecting: "Rejecting…",
      error: "Something went wrong. Please try again.",
    },
    login: {
      heading: "Milkweed admin",
      subtitle: "Enter the project password to add official pins.",
      passwordLabel: "Password",
      signIn: "Sign in",
      signingIn: "Signing in…",
      error: "Couldn't sign in.",
    },
    form: {
      siteName: "Site name",
      address: "Address",
      addressHint:
        "Geocoded automatically. Include the city and state — the pin shows at this exact spot, so use public sites only.",
      count: "Number of milkweed",
      countHint: "Optional — leave blank if you don't have an exact number.",
      eventLegend: "Event (optional)",
      eventHint:
        "Fill this in if the planting happened as part of an event — a community planting day, a school workshop.",
      eventName: "Event name",
      eventDate: "Event date",
      description: "Description",
      photo: "Photo",
      optional: "Optional.",
      add: "Add pin",
      adding: "Adding…",
      supabaseError: "Supabase isn't configured, so the photo can't upload.",
      uploadError: "The photo failed to upload. Please try again.",
      addError: "Failed to add the pin.",
      added: "Added",
      at: "at",
      addedTail: "Check the map to confirm it landed in the right spot.",
    },
  },
  es: {
    toggleAria: "Idioma",
    notConfigured: {
      title: "Panel no configurado",
      set: "Configura",
      and: "y",
      plus: "(además de",
      tail: ") en tu entorno y recarga.",
    },
    page: {
      adminTitle: "Panel de algodoncillo",
      title: "Puntos oficiales de algodoncillo",
      intro:
        "Algodoncillo plantado por Claudia o con Women for Green Spaces. Aparecen en el mapa público con el marcador verde, en su ubicación exacta, así que agrega solo sitios públicos como jardines, escuelas y parques, nunca la casa de alguien.",
      existing: "Puntos existentes",
      none: "Aún no hay puntos oficiales — agrega el primero arriba.",
      unpublished: "no publicado",
      milkweedUnit: "algodoncillos",
      countUnrecorded: "Sin conteo registrado",
      tableHint1: "Para editar o eliminar un punto, abre",
      tableHint2: "en el Editor de Tablas de Supabase — pon",
      tableHint3: "en false para ocultarlo del mapa sin borrarlo.",
    },
    submissions: {
      heading: "Envíos de la comunidad",
      intro:
        "Plantas que la gente agregó desde el formulario público. Al aprobar aparece un punto con mariposa en el mapa (la ubicación exacta ya está difuminada por privacidad). Al rechazar se oculta.",
      none: "No hay nada pendiente de revisión — estás al día.",
      noName: "Anónimo",
      approve: "Aprobar",
      reject: "Rechazar",
      approving: "Aprobando…",
      rejecting: "Rechazando…",
      error: "Algo salió mal. Inténtalo de nuevo.",
    },
    login: {
      heading: "Panel de algodoncillo",
      subtitle: "Ingresa la contraseña del proyecto para agregar puntos oficiales.",
      passwordLabel: "Contraseña",
      signIn: "Iniciar sesión",
      signingIn: "Iniciando sesión…",
      error: "No se pudo iniciar sesión.",
    },
    form: {
      siteName: "Nombre del sitio",
      address: "Dirección",
      addressHint:
        "Se geocodifica automáticamente. Incluye la ciudad y el estado — el punto aparece en este lugar exacto, así que usa solo sitios públicos.",
      count: "Número de algodoncillos",
      countHint: "Opcional — déjalo en blanco si no tienes un número exacto.",
      eventLegend: "Evento (opcional)",
      eventHint:
        "Completa esto si la siembra fue parte de un evento — un día comunitario de siembra, un taller escolar.",
      eventName: "Nombre del evento",
      eventDate: "Fecha del evento",
      description: "Descripción",
      photo: "Foto",
      optional: "Opcional.",
      add: "Agregar punto",
      adding: "Agregando…",
      supabaseError: "Supabase no está configurado, así que la foto no se puede subir.",
      uploadError: "La foto no se pudo subir. Inténtalo de nuevo.",
      addError: "No se pudo agregar el punto.",
      added: "Se agregó",
      at: "en",
      addedTail: "Revisa el mapa para confirmar que quedó en el lugar correcto.",
    },
  },
} as const;

export type AdminDict = (typeof adminDict)[AdminLang];
export type LoginStrings = AdminDict["login"];
export type FormStrings = AdminDict["form"];
export type SubmissionsStrings = AdminDict["submissions"];

export function getAdminDict(lang: AdminLang): AdminDict {
  return adminDict[lang];
}

// Narrow an arbitrary cookie value to a supported language, defaulting to English.
export function normalizeLang(value: string | undefined): AdminLang {
  return value === "es" ? "es" : "en";
}
