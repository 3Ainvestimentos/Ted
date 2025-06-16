import { RiskAssessmentForm } from "@/components/forms/risk-assessment-form";

export default function RiskAssessmentPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-semibold tracking-tight">Risk Assessment</h1>
      </div>
      <RiskAssessmentForm />
    </div>
  );
}
