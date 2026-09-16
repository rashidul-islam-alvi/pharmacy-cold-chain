export type NurseNotification = {
  title: string;
  message: string;
};

export function createNurseNotification({
  courier,
  etaMinutes,
}: {
  courier: string;
  etaMinutes: number;
}): NurseNotification {
  return {
    title: "Cold-chain medication delivery",
    message:
      `Courier: ${courier}\n` +
      `ETA: ${etaMinutes} minutes\n` +
      `Open the pharmacy app for details.`,
  };
}
