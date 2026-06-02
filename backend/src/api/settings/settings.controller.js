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
    if (banners.length > 10) {
      return res.status(400).json({ message: "배너는 최대 10개까지 등록할 수 있습니다." });
    }
    for (const b of banners) {
      if (!b.imageUrl || typeof b.imageUrl !== "string") {
        return res.status(400).json({ message: "각 배너에 imageUrl이 필요합니다." });
      }
      if (b.linkUrl !== undefined && b.linkUrl !== "") {
        try {
          const parsed = new URL(b.linkUrl);
          if (!["http:", "https:"].includes(parsed.protocol)) {
            return res.status(400).json({ message: "linkUrl은 http 또는 https URL이어야 합니다." });
          }
        } catch {
          return res.status(400).json({ message: "linkUrl 형식이 올바르지 않습니다." });
        }
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
