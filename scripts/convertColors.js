const hslToHex = (h, s, l) => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color);
  };
  return (
    "#" + [f(0), f(8), f(4)].map((x) => x.toString(16).padStart(2, "0")).join("")
  );
};

const vars = {
  background: [0, 0, 100],
  foreground: [222.2, 47.4, 11.2],
  card: [0, 0, 100],
  'card-foreground': [222.2, 47.4, 11.2],
  primary: [221.2, 83.2, 53.3],
  'primary-foreground': [210, 40, 98],
  secondary: [210, 40, 96.1],
  'secondary-foreground': [222.2, 47.4, 11.2],
  muted: [210, 40, 96.1],
  'muted-foreground': [215.4, 16.3, 46.9],
  accent: [210, 40, 96.1],
  'accent-foreground': [222.2, 47.4, 11.2],
  destructive: [0, 84.2, 60.2],
  'destructive-foreground': [210, 40, 98],
  border: [214.3, 31.8, 91.4],
  input: [214.3, 31.8, 91.4],
  'police-blue': [221, 83, 53],
  'police-dark': [222, 47, 11],
  success: [142, 76, 36],
  warning: [38, 92, 50],
  info: [199, 89, 48],
};

for (const [key, [h, s, l]] of Object.entries(vars)) {
  console.log(key, hslToHex(h, s, l));
}
