"use client";

import { useAdminBlogCategories, useDeleteBlogCategory } from "@/_services/hooks/blogs/use-admin-blog-posts";
import { Edit, Trash2, Tag } from "lucide-react";

interface BlogCategoriesListProps {
  onCreateCategory: () => void;
}

export const BlogCategoriesList = ({ onCreateCategory }: BlogCategoriesListProps) => {
  const { data: categories = [], isLoading, error } = useAdminBlogCategories();
  const deleteCategoryMutation = useDeleteBlogCategory();

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategoryMutation.mutateAsync(categoryId);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading categories. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-500 mb-4">Create your first category to organize your blog posts.</p>
            <button
              onClick={onCreateCategory}
              className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Tag className="w-4 h-4 mr-2" />
              Create Category
            </button>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: category.color || '#6B7280' }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-4">{category.postCount} posts</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      category.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    title="Edit Category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={deleteCategoryMutation.isPending}
                    className="text-red-400 hover:text-red-600 disabled:opacity-50"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
