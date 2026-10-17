import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* Plain, readable layout for the legal pages: one column, comfortable measure, clear headings. */
const LegalPageLayout = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <>
    <Header />
    <main className="px-[clamp(16px,2.8vw,44px)] pb-[14svh] pt-[10svh]">
      <article
        className="mx-auto max-w-[68ch] text-[17px] leading-[1.7] text-ink-2
          [&_a]:font-bold [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4
          [&_h2]:mb-3 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:tracking-[-0.02em] [&_h2]:text-foreground
          [&_li]:mb-1 [&_p]:mb-4 [&_strong]:text-foreground [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
      >
        <h1 className="mb-10 text-[clamp(40px,6vw,72px)] leading-[1] tracking-[-0.04em] text-foreground">{title}</h1>
        {children}
      </article>
    </main>
    <Footer />
  </>
);

export default LegalPageLayout;
