import { ExecutiveSummaryForm } from "@/components/forms/executive-summary-form";

export default function ExecutiveSummariesPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
         <h1 className="text-3xl font-headline font-semibold tracking-tight">Executive Summaries</h1>
      </div>
      <ExecutiveSummaryForm />
    </div>
  );
}
