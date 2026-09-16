import { searchRxNorm } from "./client";

type RxNormCandidate = {
  rxcui: string;
  rxaui: string;
  score: string;
  rank: string;
  name?: string;
  source?: string;
};

type RxNormResponse = {
  approximateGroup?: {
    inputTerm?: string | null;
    candidate?: RxNormCandidate[];
  };
};

export type RxNormValidationResult = {
  valid: boolean;
  input: string;
  rxcui: string | null;
  name: string | null;
  source: string | null;
};

export async function validateMedication(
  medication: string,
): Promise<RxNormValidationResult> {
  const result = (await searchRxNorm(medication)) as RxNormResponse;

  const candidates = result.approximateGroup?.candidate ?? [];

  const rxnormCandidate = candidates.find(
    (candidate) =>
      candidate.source === "RXNORM" && candidate.rxcui && candidate.name,
  );

  if (!rxnormCandidate) {
    return {
      valid: false,
      input: medication,
      rxcui: null,
      name: null,
      source: null,
    };
  }

  return {
    valid: true,
    input: medication,
    rxcui: rxnormCandidate.rxcui,
    name: rxnormCandidate.name ?? null,
    source: rxnormCandidate.source ?? null,
  };
}
