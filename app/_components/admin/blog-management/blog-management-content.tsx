"use client";

import { useState } from "react";
import { Plus, FileText, FolderOpen, Settings } from "lucide-react";
import { BlogPostsList } from "./blog-posts-list";
import { BlogCategoriesList } from "./blog-categories-list";
import { CreateBlogPostForm } from "./create-blog-post-form";
import { CreateBlogCategoryForm } from "./create-blog-category-form";
import { EditBlogPostForm } from "./edit-blog-post-form";
import { BlogPost } from "@/_services/hooks/blogs/use-blog-posts";

type ViewMode = 'posts' | 'categories' | 'create-post' | 'create-category' | 'edit-post';

export const BlogManagementContent = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('posts');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const renderContent = () => {
    switch (viewMode) {
      case 'posts':
        return <BlogPostsList onCreatePost={() => setViewMode('create-post')} onEditPost={(post) => {
          setEditingPost(post);
          setViewMode('edit-post');
        }} />;
      case 'categories':
        return <BlogCategoriesList onCreateCategory={() => setViewMode('create-category')} />;
      case 'create-post':
        return <CreateBlogPostForm onCancel={() => setViewMode('posts')} onSuccess={() => setViewMode('posts')} />;
      case 'create-category':
        return <CreateBlogCategoryForm onCancel={() => setViewMode('categories')} onSuccess={() => setViewMode('categories')} />;
      case 'edit-post':
        return editingPost ? (
          <EditBlogPostForm 
            post={editingPost} 
            onCancel={() => {
              setEditingPost(null);
              setViewMode('posts');
            }} 
            onSuccess={() => {
              setEditingPost(null);
              setViewMode('posts');
            }} 
          />
        ) : null;
      default:
        return <BlogPostsList onCreatePost={() => setViewMode('create-post')} onEditPost={(post) => {
          setEditingPost(post);
          setViewMode('edit-post');
        }} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">Manage blog posts and categories</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('create-post')}
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </button>
          <button
            onClick={() => setViewMode('create-category')}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Category
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setViewMode('posts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              viewMode === 'posts'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Blog Posts
          </button>
          <button
            onClick={() => setViewMode('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              viewMode === 'categories'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FolderOpen className="w-4 h-4 inline mr-2" />
            Categories
          </button>
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};
