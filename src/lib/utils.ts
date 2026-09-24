import { formatDistanceToNowStrict } from 'date-fns';

/**
 * Formate un montant avec le symbole de sa devise et exactement deux décimales.
 * Une devise inconnue est affichée comme un code texte au lieu de faire planter
 * le rendu de l'interface.
 *
 * @param amount Montant à formater.
 * @param currency Code ISO 4217 de la devise, par exemple `USD` ou `EUR`.
 * @param locale Locale utilisée pour les séparateurs et la position du symbole.
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US',
): string {
  if (!Number.isFinite(amount)) {
    return '--';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const formattedAmount = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return currency ? `${formattedAmount} ${currency}` : formattedAmount;
  }
}

/**
 * Formate une date par rapport à maintenant en français.
 *
 * @param date Date cible, chaîne ISO ou timestamp en millisecondes.
 * @returns Une valeur comme `Dans environ 3 jours`, ou `--` si la date est invalide.
 */
export function formatRelativeDate(date: Date | string): string {
  if (!Number.isFinite(new Date(date).getTime())) {
    return '--';
  }

  try {
    const relativeDate = formatDistanceToNowStrict(date, {
      addSuffix: true,
    });

    return relativeDate.charAt(0).toUpperCase() + relativeDate.slice(1);
  } catch {
    return '--';
  }
}
