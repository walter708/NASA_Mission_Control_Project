const DEFAULT_PAGE_SIZE = 1;
const DEFAULT_LIMIT_SIZE = 0;

function getPagnation(query) {
  const limit = Math.abs(query.limit) || DEFAULT_LIMIT_SIZE;
  const page = Math.abs(query.page) || DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * limit;

  return {
    limit,
    skip,
  };
}

module.exports = {
  getPagnation,
};
