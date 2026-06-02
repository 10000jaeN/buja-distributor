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
  const { bundleFreeThreshold, banners } = req.body;

  if (bundleFreeThreshold !== undefined && (typeof bundleFreeThreshold !== "number" || bundleFreeThreshold < 0)) {
    return res.status(400).json({ message: "bundleFreeThreshold는 0 이상의 숫자여야 합니다." });
  }

  if (banners !== undefined) {
    if (!Array.isArray(banners)) {
      return res.status(400).json({ message: "banners는 배열이어야 합니다." });
    }
    for (const b of banners) {
      if (!b.imageUrl || typeof b.imageUrl !== "string") {
        return res.status(400).json({ message: "각 배너에 imageUrl이 필요합니다." });
      }
    }
  }

  const update = {};
  if (bundleFreeThreshold !== undefined) update.bundleFreeThreshold = bundleFreeThreshold;
  if (banners !== undefined) update.banners = banners;

  const settings = await Settings.findOneAndUpdate(
    { key: "global" },
    { $set: update },
    { upsert: true, new: true }
  );
  res.json(settings);
};
