module.exports = class {
  constructor(docs, query) {
    this.docs = docs;
    this.query = query;
  }

  filter() {
    const copy = { ...this.query };
    const excludeFields = ['select', 'sort', 'page', 'limit'];
    excludeFields.forEach((el) => delete copy[el]);

    let queryStr = JSON.stringify(copy);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in)\b/g,
      (match) => `$${match}`
    );

    this.docs = this.docs.find(JSON.parse(queryStr));

    return this;
  }

  select() {
    if (this.query.select) {
      const fields = this.query.select.split(',').join(' ');
      this.docs = this.docs.select(fields);
    }

    return this;
  }

  sort() {
    if (this.query.sort) {
      const sortBy = this.query.sort.split(',').join(' ');
      this.docs = this.docs.sort(sortBy);
    } else {
      this.docs = this.docs.sort('-createdAt');
    }

    return this;
  }

  paginate() {
    const page = parseInt(this.query.page, 10) || 1;
    const limit = parseInt(this.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    this.docs = this.docs.skip(skip).limit(limit);

    return this;
  }
};
