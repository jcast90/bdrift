import config from "../../venture.config.json";

export type VentureConfig = typeof config;
export default config;

// Brand color utilities from config
export const brand = config.brand;

// Determine if we should show "Try it Free" vs "Join Waitlist"
export const isLiveMode = !config.flags?.waitlistMode || config.flags?.mvpReady;
