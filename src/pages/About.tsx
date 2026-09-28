import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="p-6 md:p-8">
    <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
    <div className="mt-4">{children}</div>
  </Card>
);

const Subsection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    <div className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{children}</div>
  </div>
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{children}</code>
);

const About = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Methodology</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            How papers are classified, how the classifier was validated, and what the outputs contain.
          </p>
        </div>

        <div className="grid gap-6">
          <Section title="Classification model">
            <div className="grid gap-6 md:grid-cols-2">
              <Subsection title="DistilBERT">
                A DistilBERT model fine-tuned on 9,624 papers (surveys from survey-only journals; research papers from
                topic- and year-matched research journals) reads each title and abstract and estimates the probability
                that the paper is a survey.
              </Subsection>
              <Subsection title="Learned combiner">
                <p>
                  A small learned combiner weighs the DistilBERT score against interpretable cues: survey terms in the
                  title, survey or research phrasing in the abstract, and the reference count.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["survey", "review", "overview", "tutorial", "taxonomy", "state of the art", "comparative study"].map(
                    (keyword) => (
                      <Badge key={keyword} variant="secondary" className="font-normal">
                        {keyword}
                      </Badge>
                    )
                  )}
                </div>
              </Subsection>
            </div>

            <div className="mt-6 grid gap-6 border-t pt-6 md:grid-cols-3">
              <Subsection title="Magazine overviews">
                Magazine articles flagged by the model that do not describe themselves as surveys are reported as
                magazine overviews and retained unless you choose to exclude them.
              </Subsection>
              <Subsection title="Title-only records">
                Records with only a title (no abstract, venue or type) count as surveys only if the title says so,
                which prevents books from being classified as surveys.
              </Subsection>
              <Subsection title="Non-papers">
                Books, editorials and errata are identified from their publication type or title. They are never
                counted as surveys and stay in both the original and adjusted metrics.
              </Subsection>
            </div>
          </Section>

          <Section title="Validation">
            <div className="grid gap-6 md:grid-cols-2">
              <Subsection title="Held-out test set">95% accuracy on 1,925 held-out papers.</Subsection>
              <Subsection title="Unseen venues">
                92% F1 on 970 arXiv papers from 45 journals that were not used in training.
              </Subsection>
              <Subsection title="Author profiles">
                96% of unseen papers on five authors' Google Scholar top-20 lists classified correctly.
              </Subsection>
              <Subsection title="Error handling">
                Missing abstracts are handled explicitly, and invalid input is reported as an error rather than
                guessed.
              </Subsection>
            </div>
          </Section>

          <Section title="Outputs">
            <div className="grid gap-6 md:grid-cols-2">
              <Subsection title="Files">
                <ul className="space-y-1.5">
                  <li>
                    <Code>non-survey-papers.csv</Code>: all papers used for the adjusted metrics (research,
                    non-papers and, unless excluded, magazine overviews)
                  </li>
                  <li>
                    <Code>excluded-papers.csv</Code>: survey/review papers, with category and survey score
                  </li>
                </ul>
              </Subsection>
              <Subsection title="Metrics">
                <ul className="list-disc space-y-1.5 pl-4">
                  <li>h-index with and without excluded papers</li>
                  <li>i10-index with and without excluded papers</li>
                  <li>Total citations and citations attributable to excluded papers</li>
                  <li>Share of papers and citations excluded</li>
                </ul>
              </Subsection>
            </div>
          </Section>

          <Section title="Input requirements">
            <div className="grid gap-6 md:grid-cols-3">
              <Subsection title="Columns">
                <ul className="space-y-1.5">
                  <li>
                    <Code>title</Code> (required)
                  </li>
                  <li>
                    <Code>n_citation</Code> (required; <Code>citations</Code> or <Code>citationCount</Code> also
                    accepted)
                  </li>
                  <li>
                    <Code>abstract</Code>, <Code>venue</Code>, <Code>type</Code> (recommended)
                  </li>
                </ul>
              </Subsection>
              <Subsection title="File format">
                <ul className="list-disc space-y-1.5 pl-4">
                  <li>CSV, UTF-8 encoded</li>
                  <li>Header row first</li>
                  <li>Maximum 50 MB</li>
                </ul>
              </Subsection>
              <Subsection title="Preprocessing">
                <ul className="list-disc space-y-1.5 pl-4">
                  <li>Rows without a title are skipped</li>
                  <li>Missing citation counts are treated as zero</li>
                  <li>LaTeX and HTML markup is removed</li>
                </ul>
              </Subsection>
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
};

export default About;
