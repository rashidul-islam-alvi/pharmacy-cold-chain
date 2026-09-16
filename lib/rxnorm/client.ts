const RXNORM_BASE_URL = "https://rxnav.nlm.nih.gov/REST";

export async function searchRxNorm(medication: string) {
  const url =
    `${RXNORM_BASE_URL}/approximateTerm.json` +
    `?term=${encodeURIComponent(medication)}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`RxNorm request failed (${response.status})`);
  }

  return response.json();
}
