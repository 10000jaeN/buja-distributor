const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // 공백을 -로
    .replace(/[^\w가-힣-]+/g, "") // 특수문자 제거 (한글 포함)
    .replace(/--+/g, "-"); // 여러 개의 -를 하나로
};

export default slugify;
