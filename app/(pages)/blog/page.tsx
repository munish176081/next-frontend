"use client";
import { Suspense, useState, useEffect } from "react";
import { useBlogPosts, useFeaturedBlogPosts, useRecentBlogPosts } from "@/_services/hooks/blogs/use-blog-posts";
import { useBlogCategories } from "@/_services/hooks/blogs/use-blog-categories";
import SubscribeBox from "@/_components/SubscribeBox";

export const dynamic = 'force-dynamic';

function Blogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useBlogCategories();
  
  // Fetch blog posts with filters
  const { data: blogPostsData, isLoading: postsLoading } = useBlogPosts({
    search: searchQuery,
    category: selectedCategory || undefined,
    page: currentPage,
    limit: 9,
    status: 'published',
    sortBy: 'publishedAt',
    sortOrder: 'DESC'
  });
  
  // Fetch featured posts for sidebar
  const { data: featuredPosts = [], isLoading: featuredLoading } = useFeaturedBlogPosts(3);
  
  // Fetch recent posts for sidebar
  const { data: recentPosts = [], isLoading: recentLoading } = useRecentBlogPosts(3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the query parameter
  };

  const handleCategoryChange = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
    <section className="container rounded-40 p-8 bg-white flex flex-col relative justify-center gap-3 max-md:p-4">
      <span className="font-normal flex text-[64px] m-auto relative tracking-tight max-md:text-[28px]">The&nbsp;<strong className="font-semibold">Pups4Sale</strong>&nbsp;<strong className="font-medium relative">journal <img className="absolute min-w-max -ml-10 -bottom-2 max-md:hidden" src="/images/vectors/line-10.svg" /></strong><img className="w-12 h-12 ml-2 absolute -right-14 top-0 max-md:hidden" src="/images/vectors/blogSuperScriptDog.jpg" /></span>
      <span className="text-xl max-md:text-sm max-w-[512px] relative m-auto text-center">Your <strong className="font-semibold">go-to source</strong> for <strong className="font-semibold">dog care, adoption stories,</strong> and <span className="relative">everyday <img className="absolute -top-1.5 w-[120%] -left-1 max-md:-left-0.5 max-md:-top-1" src="/images/vectors/line-12.svg" alt="" /></span> pup adventures. <img className="absolute -right-[155px] -top-3 max-md:static max-md:mx-auto" src="/images/vectors/blogDogsOverlap.png" /></span>
      <form onSubmit={handleSearch} className="flex h-16 rounded-full border border-black/20 text-xl p-2 bg-white items-center w-full max-w-[712px] m-auto">
        <input 
          className="w-full h-full text-base placeholder:text-[#A8A8A8] text-black border-none outline-none bg-transparent px-4 py-0" 
          placeholder="Search blog" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="h-12 w-12 min-w-12 bg-black rounded-full items-center justify-center flex cursor-pointer">
          <img className="w-5" src="/images/vectors/search.svg" />
        </button>
      </form>
    </section>
    <section className="container flex gap-10 max-md:flex-col max-md:gap-4 max-md:flex-col">
      <div className="w-full hidden max-md:flex flex-col">
        <span className="flex whitespace-nowrap items-center text-2xl font-medium gap-4 h-14">Categories<hr className="w-full border-#CECECE border-2" /></span>
        <div className="flex flex-col gap-3">
          <label className="flex items-center mb-2 cursor-pointer">
            <input 
              className="w-6 h-6 mr-3" 
              type="radio" 
              name="blogCategory" 
              checked={selectedCategory === null}
              onChange={() => handleCategoryChange(null)}
            />
            All Categories
          </label>
          {categoriesLoading ? (
            <div className="text-center py-4">Loading categories...</div>
          ) : (
            categories.map((cat) => (
              <label key={cat.id} className="flex items-center mb-2 cursor-pointer">
                <input 
                  className="w-6 h-6 mr-3" 
                  type="radio" 
                  name="blogCategory" 
                  checked={selectedCategory === cat.slug}
                  onChange={() => handleCategoryChange(cat.slug)}
                />
                {cat.name}&nbsp;<span className="text-[#807979]">({cat.postCount})</span>
              </label>
            ))
          )}
        </div>
      </div>
      <div className="w-9/12 max-md:w-full">
        <span className="flex whitespace-nowrap items-center max-md:text-2xl text-[40px] font-medium gap-4 h-14 w-full">Featured Blogs<hr className="w-full border-#CECECE border-2" /></span>
        <div className="flex flex-wrap gap-6 pt-6 max-md:gap-4 max-md:pt-4">
          {postsLoading ? (
            <div className="w-full text-center py-8">Loading blog posts...</div>
          ) : blogPostsData && blogPostsData.posts && blogPostsData.posts.length > 0 ? (
            blogPostsData.posts.map((post) => (
              <div key={post.id} className="flex flex-col w-[calc(100%/3-16px)] max-md:w-full border border-black/20 rounded-40 overflow-hidden relative">
                <div className="w-full h-full z-10 absolute bg-gradient-to-b from-black/0 to-black/80 flex flex-col items-start justify-end text-white p-4 gap-3">
                  {post.category && (
                    <span 
                      className="flex px-4 h-8 items-center justify-center text-[10px] bg-white/15 backdrop-blur-[3px] rounded-full"
                      style={{ backgroundColor: (post.category.color || '#6B7280') + '40' }}
                    >
                      {post.category.name}
                    </span>
                  )}
                  <span className="text-2xl font-semibold leading-tight">{post.title}</span>
                  <span className="text-[10px] leading-tight">{post.description}</span>
                  <span className="text-xs font-medium leading-tight">
                    By {post.author} • {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                  </span>
                  <a 
                    href={`/blog/${post.slug}`}
                    className="flex px-4 h-10 w-full items-center justify-center text-xs bg-white/15 border border-white/20 backdrop-blur-[3px] rounded-full hover:bg-white/25 transition-colors"
                  >
                    Read More
                  </a>
                </div>
                <img 
                  className={`w-full h-full max-md:h-[450px] object-cover ${post.flipImage ? '-scale-x-100' : ''}`} 
                  src={post.featuredImage} 
                  alt={post.title} 
                />
              </div>
            ))
          ) : (
            <div className="w-full text-center py-8">No blog posts found.</div>
          )}
        </div>
      </div>
      <div className="w-3/12 max-md:w-full">
        <span className="flex whitespace-nowrap items-center text-2xl font-medium gap-4 h-14 max-md:hidden">Categories<hr className="w-full border-#CECECE border-2" /></span>
        <div className="flex flex-col gap-3 max-md:hidden">
          <label className="flex items-center mb-2 cursor-pointer">
            <input 
              className="w-6 h-6 mr-3" 
              type="radio" 
              name="blogCategory" 
              checked={selectedCategory === null}
              onChange={() => handleCategoryChange(null)}
            />
            All Categories
          </label>
          {categoriesLoading ? (
            <div className="text-center py-4">Loading categories...</div>
          ) : (
            categories.map((cat) => (
              <label key={cat.id} className="flex items-center mb-2 cursor-pointer">
                <input 
                  className="w-6 h-6 mr-3" 
                  type="radio" 
                  name="blogCategory" 
                  checked={selectedCategory === cat.slug}
                  onChange={() => handleCategoryChange(cat.slug)}
                />
                {cat.name}&nbsp;<span className="text-[#807979]">({cat.postCount})</span>
              </label>
            ))
          )}
        </div>
        <span className="flex whitespace-nowrap items-center text-2xl font-medium gap-4 h-14 mt-8 max-md:mt-4">Related<hr className="w-full border-#CECECE border-2" /></span>
        <div className="flex flex-col gap-6 mt-2">
          {recentLoading ? (
            <div className="text-center py-4">Loading recent posts...</div>
          ) : recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <a key={post.id} className="flex gap-4" href={`/blog-detail/${post.slug}`}>
                <span className="w-[150px] min-w-[150px] h-[130px] rounded-xl overflow-hidden">
                  <img className="w-full h-full object-cover" src={post.featuredImage} alt={post.title} />
                </span>
                <span className="text-xs min-h-full gap-1 py-1 text-[#606060] flex flex-col">
                  {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                  <strong className="text-lg my-auto leading-tight text-black font-medium">{post.title}</strong>
                  By {post.author}
                </span>
              </a>
            ))
          ) : (
            <div className="text-center py-4">No recent posts available.</div>
          )}
        </div>
      </div>
    </section>
    <SubscribeBox />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Blogs />
    </Suspense>
  );
}
