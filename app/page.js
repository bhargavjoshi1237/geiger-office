import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  FolderOpen,
  Presentation,
  Sheet,
  Smartphone,
  Wifi,
} from "lucide-react";
import LandingOfficeShowcase from "@/components/landing/landing-office-showcase";
import OfficeFeatureShowcases from "@/components/landing/office-feature-showcases";
import { SiteHeader } from "@/components/landing/site-header";
import { appHref } from "@/lib/href";

const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || "";

export const metadata = {
  title: "Office - Geiger Studio",
  description:
    "Create documents, spreadsheets, presentations, and forms in one focused Geiger Office workspace.",
};

const utilityCards = [
  {
    title: "Works with your files",
    description:
      "Create practical office files for planning, reporting, pitches, and team operations.",
    icon: FolderOpen,
  },
  {
    title: "Stay productive offline",
    description:
      "Keep drafting, editing, and organizing work even when your connection is unstable.",
    icon: Wifi,
  },
  {
    title: "Access from any device",
    description:
      "Open office tools from desktop or mobile without losing the context of your work.",
    icon: Smartphone,
  },
  {
    title: "Documents",
    description:
      "Write polished reports, briefs, plans, and working notes with familiar formatting controls.",
    icon: FileText,
  },
  {
    title: "Spreadsheets",
    description:
      "Track structured data with formulas, formatting, tabs, imports, and workbook exports.",
    icon: Sheet,
  },
  {
    title: "Presentations",
    description:
      "Build slide decks with layouts, themes, speaker notes, and editable canvas objects.",
    icon: Presentation,
  },
];

const faqs = [
  {
    question: "What is included in Geiger Office?",
    answer:
      "Geiger Office includes document, spreadsheet, slide, and form surfaces in one shared workspace.",
  },
  {
    question: "Can I try the editors before opening the workspace?",
    answer:
      "Yes. The playground on this page runs the actual Office editors locally so you can interact with them immediately.",
  },
  {
    question: "Where did the previous home screen go?",
    answer:
      "The previous Office workspace home screen now lives at /home.",
  },
  {
    question: "Can Office be used for business workflows?",
    answer:
      "Yes. It is built for team documents, planning sheets, presentation drafts, intake forms, and everyday operational work.",
  },
];

function FaqItem({ question, answer }) {
  return (
    <details className="group border-b border-zinc-800 py-4">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-medium text-zinc-200 transition-colors hover:text-white">
        {question}
        <span className="mt-0.5 text-zinc-500 transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="pt-3 text-sm leading-6 text-zinc-400">{answer}</p>
    </details>
  );
}

function Footer() {
  return (
    <footer className="relative z-30 border-t border-zinc-800/50 bg-zinc-950 px-6 pb-8 pt-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center">
                <Image src={`${assetPrefix}/logo1.svg`} alt="Logo" width={20} height={20} />
              </div>
              <span className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
                Geiger Studios
              </span>
            </div>
            <p className="max-w-sm text-sm text-zinc-500">
              Built to Manage. Designed to Create.
              <br />
              Turn your ideas into something real with a single suite that combines
              solid management tools and easy-to-use creative features.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-zinc-100">Products</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li>
                <Link href={appHref("/")} className="transition-colors hover:text-zinc-100">
                  Geiger Office
                </Link>
              </li>
              <li>
                <Link href={appHref("/document/welcome")} className="transition-colors hover:text-zinc-100">
                  Docs
                </Link>
              </li>
              <li>
                <Link href={appHref("/sheet/welcome")} className="transition-colors hover:text-zinc-100">
                  Sheets
                </Link>
              </li>
              <li>
                <Link href={appHref("/slide/welcome")} className="transition-colors hover:text-zinc-100">
                  Slides
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-zinc-100">Workspace</h4>
            <ul className="flex flex-col gap-3 text-sm text-zinc-400">
              <li>
                <Link href={appHref("/home")} className="transition-colors hover:text-zinc-100">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/form/welcome" className="transition-colors hover:text-zinc-100">
                  Forms
                </Link>
              </li>
              <li>
                <Link href="#tools" className="transition-colors hover:text-zinc-100">
                  Playground
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-zinc-100">Company</h4>
            <ul className="flex flex-col gap-3 text-sm text-zinc-400">
              <li>
                <Link href="#" className="transition-colors hover:text-zinc-100">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-zinc-100">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-zinc-100">
                  Legal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-800/50 pt-8 text-sm text-zinc-500 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Geiger Studios. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="transition-colors hover:text-zinc-300">
              Privacy Policy
            </Link>
            <Link href="#" className="transition-colors hover:text-zinc-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
      <div className="relative z-0 mt-10 flex justify-center bg-zinc-950">
        <h1 className="pointer-events-none select-none text-[13vw] font-bold leading-none tracking-tight text-zinc-100/5">
          GEIGER STUDIO
        </h1>
      </div>
    </footer>
  );
}

export default function OfficeLandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-zinc-950 font-sans text-zinc-100 selection:bg-indigo-500/30">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808030_1px,transparent_1px),linear-gradient(to_bottom,#80808030_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <SiteHeader />

      <main className="relative z-10 flex flex-1 flex-col pt-16 sm:pt-20">
        <section className="mx-auto mb-10 mt-10 flex w-full max-w-6xl items-start justify-start px-4 sm:mt-16 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-2xl font-semibold text-white sm:text-3xl">
              Create, calculate, present, and collect work in one Office suite.
            </h1>
            <p className="mb-6 max-w-xl text-sm text-zinc-400 sm:text-base">
              Geiger Office brings documents, spreadsheets, slides, and forms into a
              focused workspace for practical team workflows.
            </p>
            <Link
              href={appHref("/home")}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-zinc-100 px-6 text-sm font-medium text-zinc-950 transition-colors hover:bg-white sm:text-base"
            >
              Continue to Office
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <div id="tools" className="mx-auto my-10 w-[94%] sm:my-20 md:w-[80%]">
          <LandingOfficeShowcase ctaHref={appHref("/home")} ctaLabel="Checkout Office" />
        </div>

        <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-3">
          {utilityCards.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-sm border border-zinc-800 bg-[#191919] p-5">
              <Icon className="mb-3 h-5 w-5 text-zinc-300" />
              <h2 className="font-medium text-zinc-100">{title}</h2>
              <p className="mt-2 text-sm text-zinc-400">{description}</p>
            </article>
          ))}
        </section>

        <OfficeFeatureShowcases />

        <section
          id="questions"
          className="mx-auto mt-10 flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 md:mt-16 md:flex-row"
        >
          <div className="md:w-[35%]">
            <h2 className="text-3xl font-semibold text-white">Questions & Answers</h2>
          </div>
          <div className="md:w-[65%]">
            {faqs.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

        <section className="relative z-20 overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="container relative z-10 mx-auto flex flex-col items-center text-center">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500 sm:text-sm">
              Open source from day one
            </h3>
            <h2 className="mb-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-3xl font-black tracking-tight text-transparent drop-shadow-lg sm:mb-10 sm:text-5xl lg:text-6xl">
              TRY GEIGER NOW
            </h2>
            <div className="flex w-full max-w-md flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href={appHref("/home")}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-zinc-100 px-6 text-sm font-medium text-zinc-950 transition-colors hover:bg-white sm:w-auto"
              >
                Office
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={appHref("/")}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-zinc-100 px-6 text-sm font-medium text-zinc-950 transition-colors hover:bg-white sm:w-auto"
              >
                Contact Sales
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
