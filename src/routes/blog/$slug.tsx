// @ts-nocheck
import React, { useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { generateSEO, generateHreflangLinks } from "../../backend/lib/seo";
import { blogPosts, blogAuthors } from "../../frontend/data/blogs";
import { Navbar } from "../../frontend/features/core/Navbar";
import { FooterSection as Footer } from "../../frontend/features/core/Footer";
import { translations } from "../../frontend/features/core/i18n";
import {
  Calendar,
  Clock,
  ChevronRight,
  User,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  ArrowRight,
} from "lucide-react";
import { AuthorProfile } from "../../frontend/components/AuthorProfile";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "../../backend/lib/blog-schema";
import { getCustomBlogBySlugFn } from "../../backend/lib/custom-blogs";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    let post = blogPosts.find((p) => p.slug === params.slug);
    if (!post) {
      try {
        const customBlog = await getCustomBlogBySlugFn({ data: { slug: params.slug } });
        if (customBlog) {
          post = customBlog;
        }
      } catch (err) {
        console.error("Failed to fetch custom blog by slug:", err);
      }
    }
    if (!post || post.isHidden) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { post } = loaderData;
    const author = post.authorId ? blogAuthors[post.authorId] : undefined;

    return {
      meta: generateSEO({
        title: post.metaTitle,
        description: post.metaDescription,
        canonicalUrl: `https://www.shailrajtravels.com/blog/${post.slug}`,
        type: "article",
        image: post.ogImage || post.featuredImage,
      }),
      links: [
        { rel: "canonical", href: `https://www.shailrajtravels.com/blog/${post.slug}` },
        ...generateHreflangLinks(`https://www.shailrajtravels.com/blog/${post.slug}`),
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(generateArticleSchema(post, author?.name || "Shailraj Travels")),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            generateBreadcrumbSchema([
              { name: "Home", url: "/" },
              { name: "Blog", url: "/blog" },
              { name: post.title, url: `/blog/${post.slug}` },
            ]),
          ),
        },
        post.faqs && post.faqs.length > 0
          ? {
              type: "application/ld+json",
              children: JSON.stringify(generateFAQSchema(post.faqs)),
            }
          : undefined,
      ].filter(Boolean) as any[],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const lang = "en";
  const t = translations[lang];
  const author = blogAuthors[post.authorId];
  const reviewer = post.reviewerId ? blogAuthors[post.reviewerId] : undefined;

  // Resolve related content
  const relatedArticles = useMemo(() => {
    return blogPosts.filter((p) => post.relatedArticleSlugs.includes(p.slug)).slice(0, 3);
  }, [post.relatedArticleSlugs]);

  // Handle sharing
  const shareUrl = `https://www.shailrajtravels.com/blog/${post.slug}`;
  const shareTitle = encodeURIComponent(post.title);

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen selection:bg-brand-green/20 selection:text-brand-blue-deep flex flex-col">
      <Navbar t={t} />

      <main className="flex-1 w-full pt-28 pb-20">
        {/* Article Hero */}
        <div className="bg-white border-b border-slate-200 py-12 md:py-20 px-4 md:px-8">
          <div className="max-w-[800px] mx-auto text-center animate-reveal">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-8 flex-wrap">
              <Link to="/" className="hover:text-brand-blue transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to="/blog" className="hover:text-brand-blue transition-colors">
                Blog
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link
                to={`/blog/category/$categorySlug`}
                params={{ categorySlug: post.category.toLowerCase().replace(/\s+/g, "-") }}
                className="text-brand-blue font-medium hover:underline"
              >
                {post.category}
              </Link>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-brand-blue-deep mb-8 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-8 text-slate-500 font-medium text-sm md:text-base">
              {(author || post.authorName) && (
                <div className="flex items-center gap-3">
                  {author?.avatarUrl ? (
                    <img
                      src={author.avatarUrl}
                      alt={post.authorName || author.name}
                      className="w-10 h-10 rounded-full border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  <span className="text-slate-800 font-bold">{post.authorName || author?.name || "Editorial Team"}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-green" />
                <span>
                  {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-green" />
                <span>{post.readingTimeMinutes} min read</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Content Area */}
          <article className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-12 shadow-sm border border-slate-100">
            {/* Featured Image */}
            {post.featuredImage && (
              <div className="rounded-2xl overflow-hidden mb-12 aspect-[16/9] shadow-inner bg-slate-100">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            )}

            {/* Prose Content Container */}
            <div
              className="prose prose-slate prose-lg md:prose-xl max-w-none 
                prose-headings:font-display prose-headings:font-bold prose-headings:text-brand-blue-deep
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline
                prose-strong:text-slate-800 prose-strong:font-bold
                prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-li:text-slate-600 prose-li:mb-2
                prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6
                prose-img:rounded-2xl prose-img:shadow-md
                prose-blockquote:border-l-4 prose-blockquote:border-brand-green prose-blockquote:bg-slate-50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-slate-700
              "
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* FAQs */}
            {post.faqs && post.faqs.length > 0 && (
              <div className="mt-16 pt-12 border-t border-slate-100">
                <h2 className="text-3xl font-display font-bold text-brand-blue-deep mb-8">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                  {post.faqs.map((faq, index) => (
                    <div key={index} className="bg-slate-50 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-slate-800 mb-3">{faq.question}</h3>
                      <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share and Tags */}
            <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mr-2">
                  Tags:
                </span>
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog/tag/$tagSlug`}
                    params={{ tagSlug: tag.toLowerCase().replace(/\s+/g, "-") }}
                    className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-brand-blue hover:text-white transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mr-2">
                  Share:
                </span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-sky-500 hover:text-white transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-700 hover:text-white transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Author Box */}
            {author && (
              <div className="mt-12">
                <AuthorProfile
                  author={author}
                  reviewer={reviewer}
                  lastReviewedAt={post.lastReviewedAt}
                  publishedAt={post.publishedAt}
                />
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8 sticky top-32">
            {/* Table of Contents */}
            {post.tableOfContents && post.tableOfContents.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hidden lg:block">
                <h3 className="text-lg font-bold text-brand-blue-deep mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-brand-green rounded-full"></div>
                  Table of Contents
                </h3>
                <nav className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {post.tableOfContents.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-sm transition-colors hover:text-brand-blue ${item.level === 2 ? "text-slate-700 font-medium" : "text-slate-500 pl-4"}`}
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* CTA Box */}
            <div className="bg-brand-blue-deep rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-brand-blue-deep/20">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-blue rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-brand-green rounded-full opacity-20 blur-2xl"></div>

              <h3 className="text-2xl font-bold mb-4 relative z-10">Plan Your Sacred Journey</h3>
              <p className="text-brand-blue-light/80 text-sm mb-6 relative z-10">
                Let Shailraj Travels guide you on a hassle-free, comfortable, and spiritually
                fulfilling pilgrimage.
              </p>

              {post.relatedTourSlugs && post.relatedTourSlugs.length > 0 ? (
                <div className="space-y-3 relative z-10">
                  {post.relatedTourSlugs.slice(0, 2).map((tourSlug, idx) => {
                    const tour = require("../../frontend/features/tours/data").tours.find(
                      (t: any) => t.slug === tourSlug,
                    );
                    return (
                      <Link
                        key={idx}
                        to={`/tours/$tourSlug`}
                        params={{ tourSlug }}
                        className="flex flex-col items-start justify-between w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm group"
                      >
                        <span className="font-bold text-sm text-brand-green mb-1 flex items-center justify-between w-full">
                          Book Now
                          <ArrowRight className="w-4 h-4 text-brand-green group-hover:translate-x-1 transition-transform" />
                        </span>
                        <span className="font-medium text-[15px] truncate pr-4 text-white">
                          {tour ? tour.title : "View Tour Details"}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <a
                  href="/#tours"
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-brand-green hover:bg-brand-green-dark text-brand-blue-deep font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 relative z-10"
                >
                  Explore All Tours <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Related Articles */}
            {relatedArticles && relatedArticles.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-brand-blue-deep mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-brand-blue rounded-full"></div>
                  Related Articles
                </h3>
                <div className="space-y-6">
                  {relatedArticles.map((article) => (
                    <Link
                      key={article.slug}
                      to={`/blog/$slug`}
                      params={{ slug: article.slug }}
                      className="group block"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                          {article.featuredImage && (
                            <img
                              src={article.featuredImage}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="text-sm font-bold text-slate-800 group-hover:text-brand-blue transition-colors line-clamp-2 mb-1">
                            {article.title}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {new Date(article.publishedAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <Footer t={t} lang={lang} />
    </div>
  );
}
