import { Document, Query } from 'mongoose';

export type QueryString = {
  [key: string]: string | string[] | undefined;
};

export default class Filters<T extends Document> {
  private query: Query<T[], T>;
  private queryString: QueryString;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(): this {
    const queryObj: Partial<
      Record<string, string | string[] | Record<string, string | string[]>>
    > = {
      ...this.queryString,
    };
    const excludeFields = ['select', 'sort', 'page', 'limit'];
    excludeFields.forEach((field) => delete queryObj[field]);

    Object.keys(queryObj).forEach((key) => {
      const value = queryObj[key];

      if (value === undefined) {
        delete queryObj[key];
        return;
      }

      // Handle operators for nested objects like { price: { gte: '10' } }
      if (typeof value === 'object' && !Array.isArray(value)) {
        Object.keys(value).forEach((op) => {
          const opValue = (value as Record<string, string | string[]>)[op];
          if (opValue !== undefined) {
            (value as Record<string, string | string[]>)[`$${op}`] = opValue;
          }
          delete (value as Record<string, string | string[]>)[op];
        });
      } else if (/^(gte|gt|lte|lt|in)$/.test(key)) {
        // Convert top-level operators
        queryObj[`$${key}`] = value;
        delete queryObj[key];
      }
    });

    // Type assertion to satisfy Mongoose
    this.query = this.query.find(
      queryObj as Record<
        string,
        string | string[] | Record<string, string | string[]>
      >
    );

    return this;
  }

  select(): this {
    if (this.queryString.select) {
      const fields = (this.queryString.select as string).split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      const sortBy = (this.queryString.sort as string).split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate(): this {
    const page = parseInt(this.queryString.page as string, 10) || 1;
    const limit = parseInt(this.queryString.limit as string, 10) || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  exec(): Query<T[], T> {
    return this.query;
  }
}
