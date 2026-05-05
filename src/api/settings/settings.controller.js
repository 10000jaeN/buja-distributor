import Settings from "./settings.model.js";

// GET /settings — 공개 (프론트에서 호출)
export const getSettings = async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    { key: "global" },
    { $setOnInsert: { key: "global" } },
    { upsert: true, new: true }
  );
  res.json(settings);
};

// PATCH /settings — 어드민 전용
export const updateSettings = async (req, res) => {
  const { bundleFreeThreshold } = req.body;

  if (bundleFreeThreshold !== undefined && (typeof bundleFreeThreshold !== "number" || bundleFreeThreshold < 0)) {
    return res.status(400).json({ message: "bundleFreeThreshold는 0 이상의 숫자여야 합니다." });
  }

  const settings = await Settings.findOneAndUpdate(
    { key: "global" },
    { $set: { bundleFreeThreshold } },
    { upsert: true, new: true }
  );
  res.json(settings);
};
