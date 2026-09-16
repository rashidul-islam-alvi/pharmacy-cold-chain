"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock3,
  CircleX,
  FileText,
  FlaskConical,
  PackageCheck,
  Send,
  ShieldCheck,
  Truck,
} from "lucide-react";

const defaultHL7 = `MSH|^~\\&|HIS|HOSPITAL|PHARMACY|HOSPITAL|202609162100||OMP^O09|MSG001|P|2.5
PID|1||P001
ORC|NW|ORD001
RXO|Ceftriaxone 1 g injection`;

const steps = [
  {
    key: "indent",
    number: "01",
    title: "Indent Received",
    icon: FileText,
  },
  {
    key: "prescription",
    number: "02",
    title: "Prescription Read",
    icon: FileText,
  },
  {
    key: "rxnorm",
    number: "03",
    title: "RxNorm Validated",
    icon: FlaskConical,
  },
  {
    key: "dispense",
    number: "04",
    title: "Medication Packed",
    icon: PackageCheck,
  },
  {
    key: "delivery",
    number: "05",
    title: "Courier Assigned",
    icon: Truck,
  },
  {
    key: "notification",
    number: "06",
    title: "Nurse Notified",
    icon: Send,
  },
  {
    key: "audit",
    number: "07",
    title: "Audit Recorded",
    icon: ShieldCheck,
  },
];

export default function Home() {
  const [hl7, setHl7] = useState(defaultHL7);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function processIndent() {
    setProcessing(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch("/api/pharmacy/process-order", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: hl7,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Workflow failed");
      }

      setResult(data.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setProcessing(false);
    }
  }

  const completed = result?.approved;
  const rejected = result && !result.approved;

  return (
    <main className="min-h-screen bg-[#f5f6f4] text-[#17211b]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <header className="mb-10 flex items-start justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Pharmacy System
              </span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight">
              Cold Chain → IPD
            </h1>

            <p className="mt-2 max-w-xl text-sm text-neutral-500">
              Pharmacy medication fulfillment and inpatient delivery workflow.
            </p>
          </div>

          <div className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium shadow-sm">
            HL7 + FHIR
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          {/* HL7 Input */}
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Incoming order
              </p>

              <h2 className="mt-1 text-xl font-semibold">HL7 v2 · OMP^O09</h2>
            </div>

            <textarea
              value={hl7}
              onChange={(e) => setHl7(e.target.value)}
              className="min-h-[250px] w-full resize-none rounded-2xl border border-neutral-200 bg-[#f8f9f7] p-4 font-mono text-xs leading-6 outline-none transition focus:border-neutral-400"
              spellCheck={false}
            />

            <button
              onClick={processIndent}
              disabled={processing}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#17211b] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#26352c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing ? (
                <>
                  <Clock3 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Process Indent
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
          </section>

          {/* Workflow */}
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Live workflow
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Medication Journey
                </h2>
              </div>

              {result && (
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    completed
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {completed ? "APPROVED" : "REJECTED"}
                </span>
              )}
            </div>

            <div>
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                          completed
                            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                            : rejected && index < 2
                              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                              : rejected && index === 2
                                ? "border-red-200 bg-red-50 text-red-600"
                                : "border-neutral-200 bg-neutral-50 text-neutral-400"
                        }`}
                      >
                        {rejected && index === 2 ? (
                          <CircleX className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>

                      {index !== steps.length - 1 && (
                        <div className="my-1 h-8 w-px bg-neutral-200" />
                      )}
                    </div>

                    <div className="flex-1 pb-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-neutral-400">
                          {step.number}
                        </span>

                        <h3 className="text-sm font-semibold">{step.title}</h3>

                        {completed && (
                          <Check className="ml-auto h-4 w-4 text-emerald-500" />
                        )}
                        {rejected && index < 2 && (
                          <Check className="ml-auto h-4 w-4 text-emerald-500" />
                        )}
                        {rejected && index === 2 && (
                          <CircleX className="ml-auto h-4 w-4 text-red-500" />
                        )}
                      </div>

                      {step.key === "prescription" && result && (
                        <p className="mt-1 text-xs text-neutral-500">
                          MedicationRequest/
                          {result.validation ? result.order?.orderId : ""}
                          {" · "}
                          {result.prescribedMedication}
                        </p>
                      )}

                      {step.key === "rxnorm" && result?.validation && (
                        <p
                          className={`mt-1 text-xs ${
                            result.validation.valid
                              ? "text-neutral-500"
                              : "text-red-600"
                          }`}
                        >
                          {result.validation.valid
                            ? `RxCUI ${result.validation.rxcui} · ${result.validation.name}`
                            : `No RxNorm match found for “${result.validation.input}”`}
                        </p>
                      )}

                      {step.key === "delivery" && result?.dispense && (
                        <p className="mt-1 text-xs text-neutral-500">
                          Courier:{" "}
                          {result.notification?.message
                            ?.split("\n")[0]
                            ?.replace("Courier: ", "")}
                          {" · ETA: "}
                          {
                            result.dispense.extension?.find((x: any) =>
                              x.url.includes("eta-minutes"),
                            )?.valueInteger
                          }{" "}
                          min
                        </p>
                      )}

                      {step.key === "audit" && result?.audit && (
                        <p className="mt-1 font-mono text-[10px] text-neutral-400">
                          AuditEvent/
                          {result.audit.id}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Result summary */}
        {result && (
          <section className="mt-6">
            {rejected ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">
                      Order rejected
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">
                      Medication was not approved for fulfillment
                    </h3>
                    <p className="mt-1 text-sm text-red-800">
                      No RxNorm match was found for “{result.validation?.input}
                      ”. Dispensing, delivery, and audit recording were skipped.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard
                  label="Medication"
                  value={result.validation?.name}
                  detail={`RxCUI ${result.validation?.rxcui}`}
                />

                <InfoCard
                  label="Delivery"
                  value="Rahim"
                  detail="ETA · 15 minutes"
                />

                <InfoCard
                  label="Audit"
                  value={`AuditEvent/${result.audit?.id}`}
                  detail="SHA-256 chain recorded"
                />
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
        {label}
      </p>

      <p className="mt-3 text-lg font-semibold">{value}</p>

      <p className="mt-1 font-mono text-xs text-neutral-400">{detail}</p>
    </div>
  );
}
