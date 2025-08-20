import { ExecutiveSummaryForm } from "@/components/forms/executive-summary-form";

export default function ExecutiveSummariesPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
         <h1 className="font-headline text-3xl font-semibold tracking-tight">Sumários Executivos</h1>
      </div>
      <ExecutiveSummaryForm />
    </div>
  );
}
