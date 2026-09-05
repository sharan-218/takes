import type { SettingDescriptor, SettingId } from "../types";

export const SETTINGS: Record<SettingId, SettingDescriptor> = {
  kitchen: {
    id: "kitchen",
    name: "Bright Kitchen",
    prompt: "modern minimal kitchen, marble counter, soft window light from left, white cabinets, neutral palette",
    lighting: "soft natural window light, diffused, 5500K",
    lens: "35mm equivalent, shallow depth of field",
    mood: "warm, aspirational, lived-in",
    colorTempK: 5500,
    backgroundHint: "marble counter and soft daylight bokeh",
  },
  street: {
    id: "street",
    name: "Urban Street",
    prompt: "city street at golden hour, blurred pedestrians, painted wall backdrop, cinematic motion",
    lighting: "golden hour backlight, 3200K warm fill",
    lens: "50mm equivalent, cinematic bokeh",
    mood: "confident, on-the-go, real",
    colorTempK: 3200,
    backgroundHint: "golden hour bokeh and city movement",
  },
  studio: {
    id: "studio",
    name: "Studio White",
    prompt: "clean white cyc studio, three-point lighting, no background distraction",
    lighting: "three-point, key 45 degrees, fill soft, rim sharp",
    lens: "85mm equivalent, tack-sharp",
    mood: "premium, controlled, editorial",
    colorTempK: 5600,
    backgroundHint: "seamless white cyc",
  },
  gym: {
    id: "gym",
    name: "Gym Floor",
    prompt: "industrial gym, sweat-glistening skin, dramatic side light, equipment blurred in background",
    lighting: "harsh side key, 4500K, high contrast",
    lens: "24mm equivalent, wide and present",
    mood: "intense, motivational, raw",
    colorTempK: 4500,
    backgroundHint: "industrial gym equipment bokeh",
  },
  office: {
    id: "office",
    name: "Modern Office",
    prompt: "modern open-plan office, plants, natural light, casual professional setting",
    lighting: "diffused overhead + warm practicals",
    lens: "35mm equivalent, natural perspective",
    mood: "productive, friendly, professional",
    colorTempK: 4800,
    backgroundHint: "office plants and warm practicals",
  },
};

export const SETTING_LIST: SettingDescriptor[] = Object.values(SETTINGS);
