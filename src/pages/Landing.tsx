import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { APP_NAME, Navigation } from "@/components/Navigation";
import { ArrowRight } from "lucide-react";

const features = [
  {
    title: "Hybrid classifier",
    description:
      "A fine-tuned DistilBERT model combined with title, abstract and reference-count cues to identify survey and review papers.",
  },
  {
    title: "Validated accuracy",
    description:
      "95% accuracy on 1,925 held-out papers, cross-checked against authors' Google Scholar profiles.",
  },
  {
    title: "Citation metrics",
    description: "h-index, i10-index and total citations computed with and without the excluded papers.",
  },
  {
    title: "Runs locally",
    description: "The model runs on your machine. Uploaded publication lists are not sent to any external service.",
  },
];

const steps = [
  {
    title: "Upload",
    description: "Provide a CSV publication list with titles and citation counts. Abstracts, venues and types improve accuracy.",
  },
  {
    title: "Classify",
    description: "Each paper is labelled as survey/review, non-paper, magazine overview or research.",
  },
  {
    title: "Review and export",
    description: "Compare metrics, check the most-cited exclusions and download non-survey and excluded papers as CSV.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="border-b bg-card">
        <div className="container mx-auto max-w-5xl px-6 py-20">
          <p className="text-sm font-medium text-primary">Publication analysis</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
            Separate survey/review papers from original research
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Classify every paper in a publication list, then see how an author's h-index, i10-index and citation
            count change when only non-survey papers are counted.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/classify">
                Classify a publication list
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">Read the methodology</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Capabilities</h2>
        <div className="mt-6 grid gap-px overflow-hidden rounded-md border bg-border sm:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="bg-card p-6">
              <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-6 pb-20">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Workflow</h2>
        <ol className="mt-6 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-primary pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step {index + 1}</p>
              <h3 className="mt-1 text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="border-t bg-card">
        <div className="container mx-auto flex max-w-5xl flex-col gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{APP_NAME}</span>
          <nav className="flex gap-4">
            <Link to="/classify" className="hover:text-foreground">Classify</Link>
            <Link to="/about" className="hover:text-foreground">Methodology</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
