"use client";
import { Suspense, useState, useEffect } from "react";
import { useBlogPostBySlug, useRelatedBlogPosts } from "@/_services/hooks/blogs/use-blog-posts";
import { Autoplay, Navigation, Swiper, SwiperSlide } from "@/_components/ui/slider";
import ActionIcon from "@/_components/ui/action-icon";
import { useParams } from "next/navigation";
import SubscribeBox from "@/_components/SubscribeBox";

export const dynamic = 'force-dynamic';

function BlogDetailContent() {
  const params = useParams();
  const slug = params.slug as string;
  
  const { data: blogPost, isLoading, error } = useBlogPostBySlug(slug);
  const { data: relatedPosts = [] } = useRelatedBlogPosts(blogPost?.id || '', 4);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="container flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="container flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-gray-600">The blog post you're looking for doesn't exist or has been removed.</p>
          <a 
            href="/blog" 
            className="inline-block mt-4 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Back to Blog
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
  {/* Background Vector */}
  <img
    className="absolute w-full top-0 max-md:top-[350px]"
    src="/images/vectors/blogDetails.png"
    alt=""
  />

  <section className="container flex flex-col gap-6 relative z-10 max-md:items-start max-md:gap-3 max-2xl:px-4">
    {/* Category Badge */}
    <span
      className="bg-black/15 py-3 px-6 text-[22px] mx-auto max-md:m-0 font-medium rounded-full max-md:text-xs max-md:py-2 max-md:px-4"
      style={{
        backgroundColor:
          blogPost.category?.color?.concat("40") || "rgba(0,0,0,0.15)",
      }}
    >
      {blogPost.category?.name || "Uncategorized"}
    </span>

    {/* Title */}
    <span className="text-center max-md:text-left text-[64px] font-semibold mx-auto max-md:m-0 max-md:text-[32px] max-w-[900px]">
      {blogPost.title}
    </span>

    {/* Description */}
    <span className="text-center max-md:text-left text-[22px] mx-auto max-md:m-0 max-md:text-sm max-w-[800px] text-[#606060]">
      {blogPost.description}
    </span>

    {/* Featured Image */}
    <span className="h-[750px] w-full flex rounded-40 overflow-hidden max-md:h-auto">
      <img
        className={`w-full h-full object-cover object-center ${
          blogPost.flipImage ? "-scale-x-100" : ""
        }`}
        src={blogPost.featuredImage}
        alt={blogPost.title}
      />
    </span>

    {/* Author & Date */}
    <span className="text-[#545454] text-2xl max-md:text-base font-medium">
      By {blogPost.author} •{" "}
      {blogPost.publishedAt
        ? formatDate(blogPost.publishedAt)
        : formatDate(blogPost.createdAt)}
    </span>

    {/* Blog Content */}
    <div className="flex flex-col gap-6">
      {/* Instead of prose, render sections with same styling as static */}
      <div
        className="text-[#606060] text-2xl max-md:text-[18px] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: blogPost.content }}
      />
    </div>

    {/* Related Articles */}
    {relatedPosts.length > 0 && (
      <>
        <div className="flex justify-between text-[40px] items-center font-semibold mt-20 max-md:text-[32px] max-md:mt-3">
          Related Articles
          <div className="flex gap-4 justify-center">
            <ActionIcon
              rounded="full"
              className="bg-black !h-24 max-md:hidden !w-24 swipperPrevBtn"
            >
              <img
                className="-scale-x-100"
                src="/images/vectors/nextPrevArrow.svg"
              />
            </ActionIcon>
            <ActionIcon
              rounded="full"
              className="bg-black !h-24 max-md:hidden !w-24 swipperNextBtn"
            >
              <img src="/images/vectors/nextPrevArrow.svg" />
            </ActionIcon>
          </div>
        </div>

        <div className="w-full flex">
          <Swiper
            loop={false}
            modules={[Autoplay, Navigation]}
            autoplay={{ delay: 2000 }}
            slidesPerView={1}
            spaceBetween={12}
            navigation={{
              nextEl: ".swipperNextBtn",
              prevEl: ".swipperPrevBtn",
            }}
            breakpoints={{
              300: { slidesPerView: 1.1, spaceBetween: 20 },
              840: { slidesPerView: 3, spaceBetween: 20 },
              1280: { slidesPerView: 4, spaceBetween: 20 },
            }}
          >
            {relatedPosts.map((post) => (
              <SwiperSlide
                key={post.id}
                className="!py-6 max-md:px-0 max-md:!py-0"
              >
                <div className="flex flex-col w-full border h-[550px] border-black/20 rounded-40 overflow-hidden relative">
                  <div className="w-full h-full z-10 absolute bg-gradient-to-b from-black/0 to-black/80 flex flex-col items-start justify-end text-white p-4 gap-3">
                    {/* Category */}
                    <span
                      className="flex px-4 h-8 items-center justify-center text-[10px] bg-white/15 backdrop-blur-[3px] rounded-full"
                      style={{
                        backgroundColor:
                          post.category?.color?.concat("40") ||
                          "rgba(255,255,255,0.15)",
                      }}
                    >
                      {post.category?.name || "Uncategorized"}
                    </span>

                    {/* Title */}
                    <span className="text-2xl font-semibold leading-tight line-clamp-2">
                      {post.title}
                    </span>

                    {/* Description */}
                    <span className="text-[10px] leading-tight line-clamp-3">
                      {post.description}
                    </span>

                    {/* Author + Date */}
                    <span className="text-xs font-medium leading-tight">
                      By {post.author} •{" "}
                      {post.publishedAt
                        ? formatDate(post.publishedAt)
                        : formatDate(post.createdAt)}
                    </span>

                    {/* CTA */}
                    <a
                      href={`/blog/${post.slug}`}
                      className="flex px-4 h-10 w-full items-center justify-center text-xs bg-white/15 border border-white/20 backdrop-blur-[3px] rounded-full hover:bg-white/25 transition-colors"
                    >
                      Read More
                    </a>
                  </div>

                  {/* Card Image */}
                  <img
                    className={`w-full h-full object-cover ${
                      post.flipImage ? "-scale-x-100" : ""
                    }`}
                    src={post.featuredImage}
                    alt={post.title}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </>
    )}
  </section>
</div>

      
      {/* Newsletter Subscription */}
      <SubscribeBox />
    </>
  );
}

export default function BlogDetailPage() {
  return (
    <Suspense fallback={
      <div className="container flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    }>
      <BlogDetailContent />
    </Suspense>
  );
}
