import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CtaLink from "@/components/CtaLink";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-[70svh] max-w-[880px] flex-col items-start justify-center gap-6 px-[clamp(16px,2.8vw,44px)] py-[10svh]">
        <p className="text-sm font-bold text-muted-foreground">404</p>
        <h1 className="text-[clamp(44px,7vw,96px)] leading-[0.95] tracking-[-0.045em]">Nothing left behind here.</h1>
        <p className="text-lg text-ink-2">This page does not exist, or it moved.</p>
        <CtaLink href="/">Back to the home page</CtaLink>
      </main>
      <Footer />
    </>
  );
}
