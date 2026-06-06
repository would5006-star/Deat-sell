/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from 'react';
import { BookOpen, User, Calendar, MessageSquare, ArrowLeft, Send, Hash, Sparkles } from 'lucide-react';
import { useBlogStore } from '../stores/blogStore';
import { Blog } from '../types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function BlogPage() {
  const { blogs, addComment } = useBlogStore();
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);

  // Comments form local inputs state
  const [comAuthor, setComAuthor] = useState('');
  const [comContent, setComContent] = useState('');

  const selectedBlog = blogs.find((b) => b.id === selectedBlogId);

  const handleCommentSubmit = (e: FormEvent, blogId: string) => {
    e.preventDefault();
    if (!comContent.trim()) {
      toast.error('Comment text cannot be empty.');
      return;
    }

    addComment(blogId, {
      author: comAuthor.trim() || 'Anonymous Creator',
      content: comContent.trim(),
    });

    toast.success('Comment published instantly (persisted in offline state)!');
    setComAuthor('');
    setComContent('');
  };

  // Format dynamic dates safely offline
  const formatDateSafe = (isoString: string) => {
    try {
      return format(new Date(isoString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" id="blog-root-container">
      
      {/* 1. BLOG ARTICLE DETAIL VIEW */}
      {selectedBlog ? (
        <div className="space-y-6 max-w-4xl mx-auto" id="blog-detail-view">
          
          {/* Back Trigger */}
          <button
            onClick={() => setSelectedBlogId(null)}
            className="inline-flex items-center space-x-1 rounded-lg bg-white/5 border border-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/10 transition-colors"
            id="blog-back-to-list"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Article List</span>
          </button>

          {/* Article Contents */}
          <div className="rounded-2xl border border-white/5 bg-surface-dark overflow-hidden">
            
            {/* Cover and details header */}
            <div className="relative aspect-video w-full bg-bg-dark">
              <img 
                src={selectedBlog.image} 
                alt={selectedBlog.title} 
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-dark to-transparent opacity-90" />
              
              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <span className="rounded bg-primary px-2.5 py-1 text-[10px] font-extrabold tracking-widest text-black uppercase">
                  {selectedBlog.category}
                </span>
                <h1 className="font-sans text-2xl sm:text-3xl font-black text-white leading-tight">
                  {selectedBlog.title}
                </h1>
                
                <div className="flex flex-wrap items-center space-x-4 text-xs font-semibold text-white/60">
                  <span className="flex items-center space-x-1">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span>Deat Sell Editorial Office</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Published: {formatDateSafe(selectedBlog.date)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Written text content body */}
            <div className="p-6 sm:p-8 space-y-6" id="blog-markup-body">
              <p className="font-sans text-sm sm:text-base text-white/70 leading-relaxed font-semibold">
                {selectedBlog.excerpt}
              </p>
              
              <div className="border-t border-white/5 pt-6 text-sm text-white/80 leading-relaxed space-y-4 font-normal whitespace-pre-wrap">
                {selectedBlog.content}
              </div>

              {/* Tags labels line */}
              {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
                  {selectedBlog.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center space-x-1 rounded bg-bg-dark border border-white/5 px-2 py-1 text-[10px] font-bold text-white/50 lowercase"
                    >
                      <Hash className="h-2.5 w-2.5" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* 1.1 THE COMMENTS SYSTEM CHANNEL */}
          <div className="space-y-6 pt-6" id="comments-section">
            <h3 className="text-lg font-black text-white flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span>Community Discussion ({selectedBlog.comments.length})</span>
            </h3>

            {/* Form list map grid */}
            <div className="space-y-4">
              {selectedBlog.comments.length > 0 ? (
                selectedBlog.comments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border border-white/5 bg-surface-dark p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white hover:underline">{comment.author}</span>
                      <span className="text-white/40">{formatDateSafe(comment.date)}</span>
                    </div>
                    <p className="text-xs text-white/70 font-medium leading-relaxed">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-white/40 italic font-semibold">
                  No public thoughts registered on this article yet. Be the first to express yours!
                </p>
              )}
            </div>

            {/* Submit comment action form */}
            <form 
              onSubmit={(e) => handleCommentSubmit(e, selectedBlog.id)} 
              className="rounded-xl border border-white/5 bg-surface-dark p-5 space-y-4"
              id="comment-form"
            >
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Publish Account Commentary</span>
              </h4>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-white/40">Your Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="E.g. Shreyas Verma"
                    value={comAuthor}
                    onChange={(e) => setComAuthor(e.target.value)}
                    className="w-full rounded-lg bg-bg-dark border border-white/10 px-3 py-2 text-xs font-semibold text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-white/40">Comment Contents (Required)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share your thoughts about this Instagram growth strategy..."
                  value={comContent}
                  onChange={(e) => setComContent(e.target.value)}
                  className="w-full rounded-lg bg-bg-dark border border-white/10 px-3 py-2 text-xs font-semibold text-white focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="flex items-center space-x-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-black hover:opacity-95 transition-all shadow-md shadow-primary/10"
              >
                <Send className="h-3 w-3" />
                <span>Share Review</span>
              </button>
            </form>
          </div>

        </div>
      ) : (
        /* 2. BLOG LISTING PAGE */
        <div className="space-y-8" id="blog-list-view">
          
          {/* Header titles */}
          <div className="space-y-2">
            <h1 className="font-sans text-3xl font-black text-white tracking-tight sm:text-4xl">
              Brand Growth Blueprint
            </h1>
            <p className="text-sm text-white/50 max-w-xl font-medium">
              Read educational tutorials crafted for content scaling, story triggers, and profile aesthetics. No spam. Just pure optimization keys.
            </p>
          </div>

          {/* Blogs list loop */}
          {blogs.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" id="blog-articles-grid">
              {blogs.map((blog) => (
                <div 
                  key={blog.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-surface-dark transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
                  id={`blog-item-${blog.id}`}
                >
                  
                  {/* Article Card Image */}
                  <div 
                    className="relative aspect-video w-full bg-bg-dark cursor-pointer overflow-hidden"
                    onClick={() => setSelectedBlogId(blog.id)}
                  >
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark gradient overlap shadow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent opacity-60" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="rounded bg-black/50 px-2.5 py-1 text-[9px] font-extrabold tracking-widest text-[#B388FF] uppercase backdrop-blur-md">
                        {blog.category}
                      </span>
                    </div>
                  </div>

                  {/* Text descriptions */}
                  <div className="flex-1 p-5 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-white/40 tracking-wider">
                        {formatDateSafe(blog.date)}
                      </p>
                      
                      <h3 
                        className="line-clamp-2 cursor-pointer text-base font-bold text-white transition-colors hover:text-primary leading-tight"
                        onClick={() => setSelectedBlogId(blog.id)}
                      >
                        {blog.title}
                      </h3>
                      
                      <p className="line-clamp-2 text-xs text-white/50 leading-relaxed font-semibold">
                        {blog.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto text-xs font-bold text-white/60">
                      <button
                        onClick={() => setSelectedBlogId(blog.id)}
                        className="inline-flex items-center space-x-1.5 text-primary hover:underline hover:text-primary/90"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Read Blueprint</span>
                      </button>

                      <span className="text-[10px] font-mono text-white/35 uppercase">
                        {blog.comments.length} Commits
                      </span>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-semibold text-white/55 text-center">
              No educational blueprints loaded currently. Please check back soon.
            </p>
          )}

        </div>
      )}

    </div>
  );
}
