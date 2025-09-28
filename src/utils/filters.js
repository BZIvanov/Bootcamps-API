export default class Filters {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ['select', 'sort', 'page', 'limit'];
    excludeFields.forEach((field) => delete queryObj[field]);

    Object.keys(queryObj).forEach((key) => {
      if (typeof queryObj[key] === 'object') {
        Object.keys(queryObj[key]).forEach((op) => {
          queryObj[key][`$${op}`] = queryObj[key][op];
          delete queryObj[key][op];
        });
      } else if (/^(gte|gt|lte|lt|in)$/.test(key)) {
        queryObj[`$${key}`] = queryObj[key];
        delete queryObj[key];
      }
    });

    this.query = this.query.find(queryObj);
    return this;
  }

  select() {
    if (this.queryString.select) {
      const fields = this.queryString.select.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  exec() {
    return this.query;
  }
}
