const { Category } = require('../../../../models');
const slugify = require('../../../utils/Slugify');
const { ApiError } = require('../../../utils/ApiError');

exports.create = async (name) => {
  const slug = slugify(name);
  const exists = await Category.findOne({ where: { slug } });
  if (exists) throw new ApiError(400, 'Category already exists');
  return await Category.create({ name, slug });
};

exports.findAll = async () => {
  return await Category.findAll({ order: [['name', 'ASC']] });
};

exports.update = async (id, name) => {
  const category = await Category.findByPk(id);
  if (!category) throw new ApiError(404, 'Category not found');
  return await category.update({ name, slug: slugify(name) });
};

exports.delete = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) throw new ApiError(404, 'Category not found');
  // Check for products before deleting
  const { Product } = require('../../../../models');
  const count = await Product.count({ where: { categoryId: id } });
  if (count > 0) throw new ApiError(400, 'Cannot delete category with active products');
  return await category.destroy();
};