export async function getHistoryRecords(model, userId) {
  return model.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}