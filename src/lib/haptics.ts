/**
 * Helpers pour retour haptique via la Vibration API.
 * Sur iOS Safari la Vibration API n'est pas disponible — fallback silencieux.
 */
const canVibrate = (): boolean =>
  typeof navigator !== "undefined" && "vibrate" in navigator;

export const haptic = {
  light: (): boolean => (canVibrate() ? navigator.vibrate(10) : false),
  medium: (): boolean => (canVibrate() ? navigator.vibrate(20) : false),
  heavy: (): boolean => (canVibrate() ? navigator.vibrate([30, 10, 30]) : false),
  success: (): boolean => (canVibrate() ? navigator.vibrate([10, 50, 10]) : false),
  error: (): boolean => (canVibrate() ? navigator.vibrate([50, 30, 50]) : false),
};
