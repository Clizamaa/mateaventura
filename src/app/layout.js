import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "MateAventura - ¡Aprende Matemáticas con Aventura!",
  description: "Plataforma de ejercicios de matemáticas para niños de 4° básico. ¡Aprende jugando!",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pattern-bg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
