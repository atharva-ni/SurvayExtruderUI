import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultsDisplayProps {
  results: any;
  isRunning: boolean;
}

const CATEGORIES: Record<string, { label: string; style: string }> = {
  survey: { label: "Survey/Review", style: "border-amber-200 bg-amber-50 text-amber-800" },
  "non-paper": { label: "Non-paper", style: "border-slate-200 bg-slate-100 text-slate-700" },
  "magazine-overview": { label: "Magazine overview", style: "border-sky-200 bg-sky-50 text-sky-800" },
  research: { label: "Research", style: "border-emerald-200 bg-emerald-50 text-emerald-800" },
};

const CategoryBadge = ({ category }: { category: string }) => {
  const entry = CATEGORIES[category];
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap font-medium", entry?.style)}>
      {entry?.label ?? category}
    </Badge>
  );
};

const convertToCSV = (data: any[]) => {
  if (!data || data.length === 0) return "";

  // RFC 4180 quoting: abstracts often contain commas, quotes and line breaks
  const escape = (value: unknown) => {
    if (value === null || value === undefined) return "";
    const text = String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.map(escape).join(","),
    ...data.map((row) => headers.map((header) => escape(row[header])).join(",")),
  ];

  return csvRows.join("\r\n");
};

const downloadFile = (data: any[], filename: string) => {
  const blob = new Blob([convertToCSV(data)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatChange = (before: number, after: number) => {
  const change = after - before;
  if (change === 0) return "No change";
  const percent = before > 0 ? ` (${((100 * change) / before).toFixed(1)}%)` : "";
  return `${change > 0 ? "+" : ""}${change.toLocaleString()}${percent}`;
};

const percentOf = (part: number, total: number) => ((100 * part) / Math.max(1, total)).toFixed(1);

const Stat = ({ label, value, detail }: { label: string; value: number; detail?: string }) => (
  <div className="rounded-md border bg-card px-4 py-3">
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value.toLocaleString()}</p>
    {detail && <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-3 text-sm font-semibold text-foreground">{children}</h3>
);

export const ResultsDisplay = ({ results, isRunning }: ResultsDisplayProps) => {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">3. Results</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Paper counts, citation metrics with and without the excluded papers, and downloads.
          </p>
        </div>
        {results && !isRunning && (
          <span className="shrink-0 text-xs text-muted-foreground">Completed in {results.processingTime}</span>
        )}
      </div>

      {isRunning ? (
        <div className="flex items-center justify-center gap-3 rounded-md border border-dashed py-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Classifying papers
        </div>
      ) : results ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Total papers" value={results.totalPapers} />
            <Stat
              label="Survey/review papers"
              value={results.surveyPapers}
              detail={`${percentOf(results.surveyPapers, results.totalPapers)}% of total`}
            />
            <Stat
              label="Excluded papers"
              value={results.excludedPapers}
              detail={`${results.percentPapersExcluded}% of total`}
            />
            <Stat label="Non-survey papers" value={results.nonSurveyPapers} detail="Retained for metrics" />
          </div>

          <section>
            <SectionTitle>Categories</SectionTitle>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Category</th>
                    <th className="px-4 py-2 font-medium">Includes</th>
                    <th className="px-4 py-2 text-right font-medium">Papers</th>
                    <th className="px-4 py-2 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { key: "survey", count: results.categories.survey, includes: "Surveys, reviews, tutorials", excluded: true },
                    { key: "non-paper", count: results.categories.nonPaper, includes: "Books, editorials, errata", excluded: false },
                    {
                      key: "magazine-overview",
                      count: results.categories.magazineOverview,
                      includes: "Flagged magazine articles",
                      excluded: results.excludeMagazineOverviews,
                    },
                    { key: "research", count: results.categories.research, includes: "Original research", excluded: false },
                  ].map((row) => (
                    <tr key={row.key}>
                      <td className="px-4 py-2.5"><CategoryBadge category={row.key} /></td>
                      <td className="px-4 py-2.5 text-muted-foreground">{row.includes}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{row.count.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{row.excluded ? "Excluded" : "Retained"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <SectionTitle>Citation metrics</SectionTitle>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Metric</th>
                    <th className="px-4 py-2 text-right font-medium">All papers</th>
                    <th className="px-4 py-2 text-right font-medium">Non-survey papers</th>
                    <th className="px-4 py-2 text-right font-medium">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y tabular-nums">
                  {[
                    { label: "h-index", before: results.hIndexBefore, after: results.hIndexAfter },
                    { label: "i10-index", before: results.i10Before, after: results.i10After },
                    { label: "Citations", before: results.totalCitations, after: results.remainingCitations },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="px-4 py-2.5 font-medium text-foreground">{row.label}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{row.before.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-foreground">{row.after.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{formatChange(row.before, row.after)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {results.excludedCitations.toLocaleString()} citations ({results.percentCitationsExcluded}%) belong to
              excluded papers.
            </p>
          </section>

          {/* Most-cited excluded papers drive the metric changes, so surface them for checking */}
          {results.allSurveyData?.length > 0 && (
            <section>
              <SectionTitle>Most-cited excluded papers</SectionTitle>
              <p className="-mt-2 mb-3 text-sm text-muted-foreground">
                These papers account for most of the change in the metrics above. Verify that each one is a
                survey or review.
              </p>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 font-medium">Title</th>
                      <th className="px-4 py-2 font-medium">Category</th>
                      <th className="px-4 py-2 text-right font-medium">Survey score</th>
                      <th className="px-4 py-2 text-right font-medium">Citations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[...results.allSurveyData]
                      .sort((a: any, b: any) => (b.citationCount ?? 0) - (a.citationCount ?? 0))
                      .slice(0, 10)
                      .map((paper: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-2.5 text-foreground">{paper.title}</td>
                          <td className="px-4 py-2.5"><CategoryBadge category={paper.Category} /></td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                            {Number(paper.SurveyScore).toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                            {(paper.citationCount ?? 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section>
            <SectionTitle>Downloads</SectionTitle>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center justify-between gap-4 rounded-md border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Non-survey papers</p>
                  <p className="text-xs text-muted-foreground">
                    {results.nonSurveyPapers.toLocaleString()} papers: original research
                    {results.excludeMagazineOverviews ? "" : ", magazine overviews"} and non-papers
                  </p>
                </div>
                <Button size="sm" onClick={() => downloadFile(results.allNonSurveyData || [], "non-survey-papers.csv")}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Excluded papers</p>
                  <p className="text-xs text-muted-foreground">
                    {results.excludedPapers.toLocaleString()} papers: surveys and reviews
                    {results.excludeMagazineOverviews ? ", magazine overviews" : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadFile(results.allSurveyData || [], "excluded-papers.csv")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Both files include the <code className="font-mono">Category</code> and{" "}
              <code className="font-mono">SurveyScore</code> columns.
            </p>
          </section>
        </div>
      ) : (
        <div className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
          Results appear here after classification.
        </div>
      )}
    </Card>
  );
};
