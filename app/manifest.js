export default function manifest() {
  return {
    name: "شركة قمة الحضارة للمقاولات",
    short_name: "قمة الحضارة",
    description: "بوابة إدارة المشروعات — شركة قمة الحضارة للمقاولات",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    lang: "ar",
    dir: "rtl",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
